const prisma = require('../prismaClient'); // Assuming you are using Prisma

// Process Transporter sheet
const processTransporter = async (records) => {
  await Promise.all(records.slice(1).map(row => {
    return prisma.transporter.upsert({
      where: { gstin: row[0] },
      update: {
        name: row[1],
        logoUrl: row[2] || null,
      },
      create: {
        name: row[1],
        gstin: row[0],
        logoUrl: row[2] || null,
      },
    });
  }));
};

// Process Station sheet
const processStation = async (records) => {
  await Promise.all(records.slice(1).map(row => {
    return prisma.station.upsert({
      where: { stationCode: row[0] },
      update: {
        name: row[1],
        location: row[2],
      },
      create: {
        stationCode: row[0],
        name: row[1],
        location: row[2],
      },
    });
  }));
};

// Process User sheet
const processUser = async (records) => {
  await Promise.all(records.slice(1).map(row => {
    return prisma.user.upsert({
      where: { email: row[0] },
      update: {
        name: row[1],
        role: row[2],
        status: row[3],
      },
      create: {
        email: row[0],
        name: row[1],
        role: row[2],
        status: row[3],
      },
    });
  }));
};

// Process ConsignorConsignee sheet
const processConsignorConsignee = async (records) => {
  await Promise.all(records.slice(1).map(row => {
    return prisma.consignorConsignee.upsert({
      where: { gstin: row[0] },
      update: {
        name: row[1],
        contactDetails: row[2],
      },
      create: {
        gstin: row[0],
        name: row[1],
        contactDetails: row[2],
      },
    });
  }));
};

// Process TruckDetails sheet
const processTruckDetails = async (records) => {
  await Promise.all(records.slice(1).map(row => {
    return prisma.truckDetails.upsert({
      where: { truckId: row[0] },
      update: {
        model: row[1],
        capacity: row[2],
      },
      create: {
        truckId: row[0],
        model: row[1],
        capacity: row[2],
      },
    });
  }));
};

// Process ItemDetails sheet
const processItemDetails = async (records) => {
  await Promise.all(records.slice(1).map(row => {
    return prisma.itemDetails.upsert({
      where: { itemCode: row[0] },
      update: {
        description: row[1],
        quantity: row[2],
      },
      create: {
        itemCode: row[0],
        description: row[1],
        quantity: row[2],
      },
    });
  }));
};

// Process ServiceProviderDetails sheet
const processServiceProviderDetails = async (records) => {
  await Promise.all(records.slice(1).map(row => {
    return prisma.serviceProviderDetails.upsert({
      where: { providerId: row[0] },
      update: {
        name: row[1],
        serviceType: row[2],
      },
      create: {
        providerId: row[0],
        name: row[1],
        serviceType: row[2],
      },
    });
  }));
};

module.exports = {
  processTransporter,
  processStation,
  processUser,
  processConsignorConsignee,
  processTruckDetails,
  processItemDetails,
  processServiceProviderDetails,
};
