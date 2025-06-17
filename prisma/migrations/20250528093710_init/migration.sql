-- CreateTable
CREATE TABLE "Station" (
    "id" SERIAL NOT NULL,
    "stationName" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,
    "shortNameForBranch" TEXT NOT NULL,
    "subBranchesName" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "typeOfOffice" TEXT NOT NULL,
    "typeOfService" TEXT NOT NULL,
    "laborChargeRateOn" TEXT NOT NULL,
    "typeOfLoading" TEXT NOT NULL,
    "laborChargeRateAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Station_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "empName" TEXT NOT NULL,
    "empMobileNo" TEXT NOT NULL,
    "roleOfUser" TEXT NOT NULL,
    "panOrAadhaarOfUser" TEXT NOT NULL,
    "typeOfUserRights" TEXT NOT NULL,
    "branchName" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsignorConsignee" (
    "id" SERIAL NOT NULL,
    "locationID" TEXT NOT NULL,
    "gstin" TEXT NOT NULL,
    "pan" TEXT NOT NULL,
    "aadhaar" TEXT NOT NULL,
    "mobileNo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "partyBillingType" TEXT NOT NULL,
    "rateAmount" DOUBLE PRECISION NOT NULL,
    "ratePeriod" TEXT NOT NULL,
    "labourChargeIncluded" BOOLEAN NOT NULL,
    "biltyChargeIncluded" BOOLEAN NOT NULL,
    "doorDeliveryCharge" DOUBLE PRECISION NOT NULL,
    "accountNo" TEXT NOT NULL,
    "ifscCode" TEXT NOT NULL,
    "upiIdOrMobileNo" TEXT NOT NULL,

    CONSTRAINT "ConsignorConsignee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TruckDetails" (
    "id" SERIAL NOT NULL,
    "truckNo" TEXT NOT NULL,
    "ownedOrRented" TEXT NOT NULL,
    "truckProviderCompanyName" TEXT NOT NULL,
    "truckProviderGstInOrPan" TEXT NOT NULL,
    "truckProviderContactNo" TEXT NOT NULL,
    "truckProviderContactName" TEXT NOT NULL,
    "freightCharge" DOUBLE PRECISION NOT NULL,
    "driverName" TEXT NOT NULL,
    "driverMobileNo" TEXT NOT NULL,
    "driverLicenseNo" TEXT NOT NULL,
    "typeOfTruck" TEXT NOT NULL,
    "truckExpiry" TIMESTAMP(3) NOT NULL,
    "weightOfTruck" DOUBLE PRECISION NOT NULL,
    "nationalPermit" BOOLEAN NOT NULL,
    "brand" TEXT NOT NULL,
    "rtoLicenseNo" TEXT NOT NULL,
    "fastag" BOOLEAN NOT NULL,
    "accountNo" TEXT NOT NULL,
    "fastagProvider" TEXT NOT NULL,
    "dieselOrPetrol" TEXT NOT NULL,
    "typeOfFuelCard" TEXT NOT NULL,
    "cardNo" TEXT NOT NULL,
    "insurance" BOOLEAN NOT NULL,
    "insuranceProvider" TEXT NOT NULL,
    "insuranceAccountNo" TEXT NOT NULL,
    "premiumAmount" DOUBLE PRECISION NOT NULL,
    "insurancePeriod" TEXT NOT NULL,
    "activeLoan" BOOLEAN NOT NULL,
    "loanProvider" TEXT NOT NULL,
    "interest" DOUBLE PRECISION NOT NULL,
    "loanAmount" DOUBLE PRECISION NOT NULL,
    "loanPeriod" TEXT NOT NULL,

    CONSTRAINT "TruckDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ItemDetails" (
    "id" SERIAL NOT NULL,
    "locationID" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "hsnCode" TEXT NOT NULL,
    "typeOfPackaging" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ItemDetails_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceProviderDetails" (
    "id" SERIAL NOT NULL,
    "gstin" TEXT NOT NULL,
    "typeOfService" TEXT NOT NULL,
    "empName" TEXT NOT NULL,
    "empMobileNo" TEXT NOT NULL,
    "empEmailId" TEXT NOT NULL,
    "commissionRateType" TEXT NOT NULL,
    "commissionRateAmount" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ServiceProviderDetails_pkey" PRIMARY KEY ("id")
);
