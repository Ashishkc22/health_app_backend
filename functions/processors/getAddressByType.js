const { ErrorEnums, ProcessorErrors } = require("../Enums");
const {
  statesSchema,
  districtSchema,
  newTehsilSchema,
  tehsilSchema,
  areaSchema,
  gramSchema,
} = require("../models");

async function getTehsil(ref_id) {
  return await newTehsilSchema.aggregate([
    {
      $match: {
        ref_id: ref_id,
      },
    },
    {
      $lookup: {
        from: "cards",
        let: { name: "$name" },
        pipeline: [
          { $match: { $expr: { $eq: ["$tehsil", "$$name"] } } },
          { $count: "totalCards" },
        ],
        as: "cardCount",
      },
    },
    {
      $unwind: {
        path: "$cardCount",
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        name: 1,
        ref_id: 1,
        active: 1,
        count: { $ifNull: ["$cardCount.totalCards", 0] }, // Set totalCards to 0 if not found
      },
    },
    { $sort: { count: -1 } },
  ]);
}

async function getGramPanchayatWithGrams({
  showGrams = false,
  ref_id = "",
} = {}) {
  return await areaSchema.aggregate([
    {
      $match: {
        $or: [{ ref_id: ref_id }, { teshil: ref_id }],
      },
    },
    { $sort: { name: 1 } },
    showGrams && {
      $lookup: {
        from: "grams",
        let: { areaId: "$_id", name: "$name" }, // Pass the _id from areas collection to the lookup stage
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: [
                  { $toObjectId: "$ref_id" }, // Convert ref_id (string) to ObjectId
                  "$$areaId", // Compare it with _id from the areas collection
                ],
              },
            },
          },
          {
            $project: {
              name: 1,
              ref_id: 1,
              active: 1,
              grampanchayat_name: "$$name",
            },
          },
        ],
        as: "grams",
      },
    },
  ]);
}

async function getAddressByType({
  type = "state",
  query = {},
  sort = { name: 1 },
  showGrams = false,
  gramWithTeshilId = false,
  projection = { name: 1 },
} = {}) {
  try {
    switch (type) {
      case "state":
        return await statesSchema.find(query).sort(sort);
      case "district":
        return await districtSchema.find(query).sort(sort);
      case "tehsil":
        return await getTehsil(query.ref_id);
      case "janPanchayat":
        return await tehsilSchema.find(query).sort(sort);
      case "gramPanchayat":
        const refId = query.ref_id;
        delete query.ref_id;
        return await areaSchema
          .find(
            {
              $or: [{ tehsil: refId }, { ref_id: refId }],
              ...query,
            },
            projection
          )
          .sort(sort);
      case "gram":
        return gramWithTeshilId
          ? await getGramPanchayatWithGrams({
              showGrams: true,
              ref_id: query.ref_id,
            })
          : await gramSchema.find(query).sort(sort);
      default:
        throw new ErrorEnums(ProcessorErrors.INVALID_ADDRESS_TYPE);
    }
  } catch (error) {
    throw error;
  }
}

module.exports = getAddressByType;
