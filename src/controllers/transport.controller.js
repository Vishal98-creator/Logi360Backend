const fs = require("fs").promises;
const XLSX = require("xlsx");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.uploadExcel = async (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ error: "No Excel file provided" });
  }

  const filePath = req.file.path;

  try {
    // Read the Excel file
    const workbook = XLSX.readFile(filePath);

    // Get all sheet names from the workbook
    const sheetNames = workbook.SheetNames;

    // Iterate through each sheet and process data
    for (let sheetName of sheetNames) {
      const sheet = workbook.Sheets[sheetName];
      const records = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Parse the sheet into rows

      // Validate the records
      if (!records || records.length === 0) {
        console.warn(`No records found in sheet: ${sheetName}`);
        continue; // Skip if the sheet is empty
      }

      // Process data based on sheet names
      switch (sheetName) {
        case "Transporter":
          await processTransporter(records);
          break;
        case "Station":
          await processStation(records);
          break;
        case "User":
          await processUser(records);
          break;
        case "ConsignorConsignee":
          await processConsignorConsignee(records);
          break;
        case "TruckDetails":
          await processTruckDetails(records);
          break;
        case "ItemDetails":
          await processItemDetails(records);
          break;
        case "ServiceProviderDetails":
          await processServiceProviderDetails(records);
          break;
        default:
          console.warn(`Unrecognized sheet: ${sheetName}`);
      }
    }

    // Clean up the file after successful processing
    await fs.unlink(filePath);

    return res.status(200).json({
      message: "Excel file imported successfully",
    });
  } catch (err) {
    // Clean up the file in case of error
    try {
      await fs.unlink(filePath);
    } catch (unlinkErr) {
      console.error("Failed to delete file:", unlinkErr);
    }

    console.error("Excel processing error:", err);
    return res.status(500).json({
      error: "Failed to process Excel file",
      details: err.message,
    });
  }
};

// Process User sheet
const processUser = async (records) => {
  await Promise.all(records.slice(1).map((row) => {
    return prisma.user.upsert({
      where: { email: String(row[0]) },
      update: {
        empName: row[1],
        empMobileNo: row[2],
        roleOfUser: row[3],
        panOrAadhaarOfUser: row[4],
        typeOfUserRights: row[5],
        branchName: row[6],
      },
      create: {
        email: String(row[0]),
        empName: row[1],
        empMobileNo: row[2],
        roleOfUser: row[3],
        panOrAadhaarOfUser: row[4],
        typeOfUserRights: row[5],
        branchName: row[6],
      },
    });
  }));
};

// Process Transporter sheet
const processTransporter = async (records) => {
  await Promise.all(records.slice(1).map((row) => {
    return prisma.transporter.upsert({
      where: { gstin: String(row[0]) }, // Ensure gstin is a string
      update: {
        name: row[1],
        logoUrl: row[2] || null, // Ensure it's either null or a string
      },
      create: {
        name: row[1],
        gstin: String(row[0]), // Ensure gstin is a string
        logoUrl: row[2] || null,
      },
    });
  }));
};


const processStation = async (records) => {
  await Promise.all(records.slice(1).map((row) => {
    const laborChargeRateAmount = isNaN(parseFloat(row[9])) ? 0 : parseFloat(row[9]);

    return prisma.station.upsert({
      where: {
        id: row[0], // Ensure the id is valid and is an integer
      },
      update: {
        branchName: row[1],
        shortNameForBranch: row[2],
        subBranchesName: row[3],
        address: row[4],
        typeOfOffice: row[5],
        typeOfService: row[6],
        laborChargeRateOn: row[7],
        typeOfLoading: row[8],
        laborChargeRateAmount: laborChargeRateAmount,  // Ensured as float
      },
      create: {
        id: row[0], // Ensure the id is valid and is an integer
        stationName: String(row[0]),  // Convert stationName to a string
        branchName: row[1],
        shortNameForBranch: row[2],
        subBranchesName: row[3],
        address: row[4],
        typeOfOffice: row[5],
        typeOfService: row[6],
        laborChargeRateOn: row[7],
        typeOfLoading: row[8],
        laborChargeRateAmount: laborChargeRateAmount,  // Ensured as float
      },
    });
  }));
};


const processConsignorConsignee = async (records) => {
  await Promise.all(records.slice(1).map((row) => {
    // Ensure locationID is passed as a string
    const locationID = String(row[0]);

    // Ensure rateAmount is valid and parse it
    const rateAmount = isNaN(parseFloat(row[8])) ? 0 : parseFloat(row[8]);

    // Convert ratePeriod to a string
    const ratePeriod = String(row[9]);

    // Ensure boolean fields are parsed correctly
    const labourChargeIncluded = row[10] === 'true'; 
    const biltyChargeIncluded = row[11] === 'true'; 

    // Ensure doorDeliveryCharge is a valid number
    const doorDeliveryCharge = isNaN(parseFloat(row[12])) ? 0 : parseFloat(row[12]);

    // Convert accountNo to string
    const accountNo = String(row[13]);

    return prisma.consignorConsignee.upsert({
      where: {
        gstin: String(row[1]),  // Ensure gstin is passed as a string
      },
      update: {
        locationID: locationID,  // Ensure locationID is passed as a string
        pan: row[2],
        aadhaar: row[3],
        mobileNo: row[4],
        name: row[5],
        address: row[6],
        partyBillingType: row[7],
        rateAmount: rateAmount,
        ratePeriod: ratePeriod, 
        labourChargeIncluded: labourChargeIncluded,
        biltyChargeIncluded: biltyChargeIncluded,
        doorDeliveryCharge: doorDeliveryCharge,
        accountNo: accountNo,
        ifscCode: row[14],
        upiIdOrMobileNo: row[15],
      },
      create: {
        locationID: locationID,
        gstin: String(row[1]),
        pan: row[2],
        aadhaar: row[3],
        mobileNo: row[4],
        name: row[5],
        address: row[6],
        partyBillingType: row[7],
        rateAmount: rateAmount,
        ratePeriod: ratePeriod, 
        labourChargeIncluded: labourChargeIncluded,
        biltyChargeIncluded: biltyChargeIncluded,
        doorDeliveryCharge: doorDeliveryCharge,
        accountNo: accountNo,
        ifscCode: row[14],
        upiIdOrMobileNo: row[15],
      },
    });
  }));
};


// Process TruckDetails sheet
const processTruckDetails = async (records) => {
  await Promise.all(records.slice(1).map((row) => {
    // Convert all relevant fields to correct types
    
    // String Fields
    const truckNo = String(row[0]);  // Convert truckNo to string
    const ownedOrRented = String(row[1]);
    const truckProviderCompanyName = String(row[2]);
    const truckProviderGstInOrPan = String(row[3]);
    const truckProviderContactNo = String(row[4]);
    const truckProviderContactName = String(row[5]);
    const driverName = String(row[7]);
    const driverMobileNo = String(row[8]);
    const driverLicenseNo = String(row[9]);
    const typeOfTruck = String(row[10]);
    const rtoLicenseNo = String(row[15]);
    const fastagProvider = String(row[18]);
    const dieselOrPetrol = String(row[19]);
    const typeOfFuelCard = String(row[20]);
    const cardNo = String(row[21]);
    const insuranceProvider = String(row[23]);
    const insuranceAccountNo = String(row[24]);
    const loanProvider = String(row[28]);
    const brand = String(row[14]); // Convert brand to string

    
    // Number Fields (ensure conversion to Float or Integer)
    const freightCharge = isNaN(parseFloat(row[6])) ? 0 : parseFloat(row[6]);
    const weightOfTruck = isNaN(parseFloat(row[12])) ? 0 : parseFloat(row[12]);
    const premiumAmount = isNaN(parseFloat(row[25])) ? 0 : parseFloat(row[25]);
    const loanAmount = isNaN(parseFloat(row[30])) ? 0 : parseFloat(row[30]);

    // Boolean Fields (convert to true/false)
    const nationalPermit = row[13] === 'true';  // Convert string "true" to boolean
    const fastag = row[16] === 'true';  // Convert string "true" to boolean
    const insurance = row[22] === 'true';  // Convert string "true" to boolean
    const activeLoan = row[27] === 'true';  // Convert string "true" to boolean

    // Date Fields (truckExpiry is assumed to be a Date string)
    // const truckExpiry = new Date(row[11]); // Ensure it's converted to a valid Date object

    const truckExpiry = Date.parse(row[11]) ? new Date(row[11]) : new Date(); // Use the current date if invalid
  // Parsing the date

    // Loan Interest Fields (convert to float)
    const interest = isNaN(parseFloat(row[29])) ? 0 : parseFloat(row[29]);

    // Ensure loanPeriod is a string
    const loanPeriod = String(row[31]);

    // Ensure fields are properly processed before upsert
    return prisma.truckDetails.upsert({
      where: {
        id: row[0], // Use `id` if it's unique, otherwise truckNo or another unique field should be used
      },
      update: {
        ownedOrRented: ownedOrRented,
        truckProviderCompanyName: truckProviderCompanyName,
        truckProviderGstInOrPan: truckProviderGstInOrPan,
        truckProviderContactNo: truckProviderContactNo,
        truckProviderContactName: truckProviderContactName,
        freightCharge: freightCharge,
        driverName: driverName,
        driverMobileNo: driverMobileNo,
        driverLicenseNo: driverLicenseNo,
        typeOfTruck: typeOfTruck,
        truckExpiry: truckExpiry,
        weightOfTruck: weightOfTruck,
        nationalPermit: nationalPermit,
        brand: brand, // Assuming `brand` can be any value, but it's marked as a string
        rtoLicenseNo: rtoLicenseNo,
        fastag: fastag,
        accountNo: String(row[17]), // Ensure accountNo is passed as a string
        fastagProvider: fastagProvider,
        dieselOrPetrol: dieselOrPetrol,
        typeOfFuelCard: typeOfFuelCard,
        cardNo: cardNo,
        insurance: insurance,
        insuranceProvider: insuranceProvider,
        insuranceAccountNo: insuranceAccountNo,
        premiumAmount: premiumAmount,
        insurancePeriod: String(row[26]), // Ensure insurancePeriod is a string
        activeLoan: activeLoan,
        loanProvider: loanProvider,
        interest: interest,
        loanAmount: loanAmount,
        loanPeriod: loanPeriod, // Ensure loanPeriod is a string
      },
      create: {
        truckNo: truckNo,
        ownedOrRented: ownedOrRented,
        truckProviderCompanyName: truckProviderCompanyName,
        truckProviderGstInOrPan: truckProviderGstInOrPan,
        truckProviderContactNo: truckProviderContactNo,
        truckProviderContactName: truckProviderContactName,
        freightCharge: freightCharge,
        driverName: driverName,
        driverMobileNo: driverMobileNo,
        driverLicenseNo: driverLicenseNo,
        typeOfTruck: typeOfTruck,
        truckExpiry: truckExpiry,
        weightOfTruck: weightOfTruck,
        nationalPermit: nationalPermit,
        brand:brand, 
        rtoLicenseNo: rtoLicenseNo,
        fastag: fastag,
        accountNo: String(row[17]), // Ensure accountNo is a string
        fastagProvider: fastagProvider,
        dieselOrPetrol: dieselOrPetrol,
        typeOfFuelCard: typeOfFuelCard,
        cardNo: cardNo,
        insurance: insurance,
        insuranceProvider: insuranceProvider,
        insuranceAccountNo: insuranceAccountNo,
        premiumAmount: premiumAmount,
        insurancePeriod: String(row[26]), // Ensure insurancePeriod is a string
        activeLoan: activeLoan,
        loanProvider: loanProvider,
        interest: interest,
        loanAmount: loanAmount,
        loanPeriod: loanPeriod, // Ensure loanPeriod is a string
      },
    });
  }));
};


// Process ItemDetails sheet
const processItemDetails = async (records) => {
  await Promise.all(records.slice(1).map((row) => {
    // Ensure string fields are properly processed
    const locationID = String(row[0]);  // Convert locationID to string
    const itemName = String(row[1]);  // Convert itemName to string
    const hsnCode = String(row[2]);  // Convert hsnCode to string
    const typeOfPackaging = String(row[3]);  // Convert typeOfPackaging to string
    const size = String(row[4]);  // Convert size to string

    // Ensure rate is a valid number and parse it
    const rate = isNaN(parseFloat(row[5])) ? 0 : parseFloat(row[5]);

    return prisma.itemDetails.upsert({
      where: { id: row[0] },  // Use `id` as the unique identifier
      update: {
        itemName: itemName,  // itemName should be a string
        hsnCode: hsnCode,  // hsnCode should be a string
        typeOfPackaging: typeOfPackaging,  // typeOfPackaging should be a string
        size: size,  // size should be a string
        rate: rate,  // rate should be a float
      },
      create: {
        locationID: locationID,  // locationID should be a string
        itemName: itemName,  // itemName should be a string
        hsnCode: hsnCode,  // hsnCode should be a string
        typeOfPackaging: typeOfPackaging,  // typeOfPackaging should be a string
        size: size,  // size should be a string
        rate: rate,  // rate should be a float
      },
    });
  }));
};


// Process ServiceProviderDetails sheet
const processServiceProviderDetails = async (records) => {
  await Promise.all(records.slice(1).map((row) => {
    return prisma.serviceProviderDetails.upsert({
      where: { id: row[0] },  // Use `id` as the unique identifier
      update: {
        gstin: String(row[1]),  // Convert `gstin` to string if necessary
        typeOfService: String(row[2]),
        empName: String(row[3]),
        empMobileNo: String(row[4]),
        empEmailId: String(row[5]),
        commissionRateType: String(row[6]),
        commissionRateAmount: parseFloat(row[7]),  // Ensure it's a float
      },
      create: {
        id: row[0],  // Ensure the `id` is used for creating new records
        gstin: String(row[1]),  // Convert `gstin` to string if necessary
        typeOfService: String(row[2]),
        empName: String(row[3]),
        empMobileNo: String(row[4]),
        empEmailId: String(row[5]),
        commissionRateType: String(row[6]),
        commissionRateAmount: parseFloat(row[7]),  // Ensure it's a float
      },
    });
  }));
};


