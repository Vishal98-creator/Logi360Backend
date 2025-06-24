import XLSX from 'xlsx';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const toBoolean = (val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'string') return val.toLowerCase() === 'true';
  return false;
};

const toDate = (val) => {
  const date = new Date(val);
  return isNaN(date.getTime()) ? null : date;
};

export const uploadMasterData = async (req, res) => {
  try {
    const file = req.file;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const response = [];

    const insertWithLogging = async (model, tableName, rawData, transformFn) => {
      try {
        if (!rawData || rawData.length === 0) {
          response.push({ table: tableName, inserted: 0, message: 'No data available in the sheet.' });
          return;
        }
        const data = rawData.map(transformFn);
        const result = await prisma[model].createMany({ data, skipDuplicates: true });
        if (result.count === 0) {
          response.push({ table: tableName, inserted: 0, message: 'No new records inserted (likely due to duplicates or constraints).' });
        } else {
          response.push({ table: tableName, inserted: result.count });
        }
      } catch (err) {
        console.error(`Error inserting into ${tableName}:`, err);
        response.push({ table: tableName, error: err.message });
      }
    };

    if (workbook.SheetNames.includes('Transporter')) {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets['Transporter']);
      await insertWithLogging('transporter', 'Transporter', rows, (row) => ({
        transporterId: row.transporterId,
        name: row.name,
        gstin: row.gstin,
        logoUrl: row.logoUrl,
        createdAt: toDate(row.createdAt),
      }));
    }

    if (workbook.SheetNames.includes('TruckDetails')) {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets['TruckDetails']);
      await insertWithLogging('truckDetails', 'TruckDetails', rows, (row) => ({
        truckId: row.truckId,
        transporterId: row.transporterId,
        truckNo: row.truckNo,
        ownedOrRented: row.ownedOrRented,
        truckProviderCompanyName: row.truckProviderCompanyName,
        truckProviderGstInOrPan: row.truckProviderGstInOrPan,
        truckProviderContactNo: row.truckProviderContactNo,
        truckProviderContactName: row.truckProviderContactName,
        freightCharge: Number(row.freightCharge),
        driverName: row.driverName,
        driverMobileNo: row.driverMobileNo,
        driverLicenseNo: row.driverLicenseNo,
        typeOfTruck: row.typeOfTruck,
        truckExpiry: toDate(row.truckExpiry),
        weightOfTruck: Number(row.weightOfTruck),
        nationalPermit: toBoolean(row.nationalPermit),
        brand: row.brand,
        rtoLicenseNo: row.rtoLicenseNo,
        fastag: toBoolean(row.fastag),
        accountNo: row.accountNo,
        fastagProvider: row.fastagProvider,
        dieselOrPetrol: row.dieselOrPetrol,
        typeOfFuelCard: row.typeOfFuelCard,
        cardNo: row.cardNo,
        insurance: toBoolean(row.insurance),
        insuranceProvider: row.insuranceProvider,
        insuranceAccountNo: row.insuranceAccountNo,
        premiumAmount: Number(row.premiumAmount),
        insurancePeriod: row.insurancePeriod,
        activeLoan: toBoolean(row.activeLoan),
        loanProvider: row.loanProvider,
        interest: Number(row.interest),
        loanAmount: Number(row.loanAmount),
        loanPeriod: row.loanPeriod,
      }));
    }

    if (workbook.SheetNames.includes('ConsignorConsignee')) {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets['ConsignorConsignee']);
      await insertWithLogging('consignorConsignee', 'ConsignorConsignee', rows, (row) => ({
        customerId: row.customerId,
        transporterId: row.transporterId,
        type: row.type,
        gstin: row.gstin,
        pan: row.pan,
        aadhaar: row.aadhaar,
        mobileNo: row.mobileNo,
        name: row.name,
        address: row.address,
        partyBillingType: row.partyBillingType,
        ratePeriod: row.ratePeriod,
        labourChargeIncluded: toBoolean(row.labourChargeIncluded),
        biltyChargeIncluded: toBoolean(row.biltyChargeIncluded),
        accountNo: row.accountNo,
        ifscCode: row.ifscCode,
        upiIdOrMobileNo: row.upiIdOrMobileNo,
      }));
    }

    if (workbook.SheetNames.includes('ItemDetails')) {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets['ItemDetails']);
      await insertWithLogging('itemDetails', 'ItemDetails', rows, (row) => ({
        itemId: row.itemId,
        locationId: row.locationId,
        transporterId: row.transporterId,
        customerID: row.customerID,
        branchName: row.branchName,
        stationName: row.stationName,
        itemName: row.itemName,
        per: row.per,
        rate: Number(row.rate),
        size: row.size,
        hammali: Number(row.hammali),
        biltyCharge: Number(row.biltyCharge),
        doorDeliveryCharge: Number(row.doorDeliveryCharge),
      }));
    }

    if (workbook.SheetNames.includes('ServiceProviderDetails')) {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets['ServiceProviderDetails']);
      await insertWithLogging('serviceProviderDetails', 'ServiceProviderDetails', rows, (row) => ({
        serviceProviderId: row.serviceProviderId,
        transporterId: row.transporterId,
        gstin: row.gstin,
        typeOfService: row.typeOfService,
        empName: row.empName,
        empMobileNo: row.empMobileNo,
        empEmailId: row.empEmailId,
        commissionRateType: row.commissionRateType,
        commissionRateAmount: Number(row.commissionRateAmount),
      }));
    }

    if (workbook.SheetNames.includes('User')) {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets['User']);
      await insertWithLogging('user', 'User', rows, (row) => ({
        empId: row.empId,
        transporterId: row.transporterId,
        empName: row.empName,
        empMobileNo: row.empMobileNo,
        roleOfUser: row.roleOfUser,
        panOrAadhaarOfUser: row.panOrAadhaarOfUser,
        typeOfUserRights: row.typeOfUserRights,
        branchName: row.branchName,
      }));
    }

    if (workbook.SheetNames.includes('Station')) {
      const rows = XLSX.utils.sheet_to_json(workbook.Sheets['Station']);
      await insertWithLogging('station', 'Station', rows, (row) => ({
        locationId: row.locationId,
        empID: row.empID,
        transporterId: row.transporterId,
        stationName: row.stationName,
        branchName: row.branchName,
        shortNameForBranch: row.shortNameForBranch,
        subBranchesName: row.subBranchesName,
        address: row.address,
        typeOfOffice: row.typeOfOffice,
        typeOfService: row.typeOfService,
        laborChargeRateOn: row.laborChargeRateOn,
        typeOfLoading: row.typeOfLoading,
        laborChargeRateAmount: Number(row.laborChargeRateAmount),
      }));
    }

    res.status(200).json({ message: 'Upload completed', results: response });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};
