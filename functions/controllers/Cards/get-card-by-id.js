const {
  cardSchema,
  statesSchema,
  districtSchema,
  newTehsilSchema,
  areaSchema,
  tehsilSchema,
  gramSchema,
} = require("../../models");
const { CustomError } = require("../../utils/custom-errors");

async function setAddressDetails(card) {
  try {
    const projection = { name: 1 };
    card.address = `${card.area}, ${card.tehsil}, ${card.district}, ${card.state}`;

    if (card.state) {
      card.state = (await statesSchema
        .findOne(
          {
            name: { $regex: card.state, $options: "i" },
          },
          projection
        )
        .lean()) || { id: "", name: card.state };
    }
    if (card.district) {
      card.district = (await districtSchema
        .findOne(
          {
            name: { $regex: card.district, $options: "i" },
          },
          projection
        )
        .lean()) || { id: "", name: card.district };
    }
    if (card.tehsil) {
      card.tehsil = (await newTehsilSchema
        .findOne(
          {
            name: card.tehsil,
          },
          projection
        )
        .lean()) || { id: "", name: card.tehsil };
    }
    if (card.janpad) {
      card.janpad = (await tehsilSchema
        .findOne(
          {
            name: card.janpad,
          },
          projection
        )
        .lean()) || { id: "", name: card.janpad };
    }
    if (card.gramPanchayat) {
      card.gramPanchayat = (await areaSchema
        .findOne(
          {
            name: card.gramPanchayat,
          },
          projection
        )
        .lean()) || { id: "", name: card.gramPanchayat };
    }
    if (card.gram) {
      card.gram = (await gramSchema
        .findOne(
          {
            name: card.gram,
          },
          projection
        )
        .lean()) || { id: "", name: card.gram };
    }
  } catch (err) {
    throw new CustomError({
      name: "AddressError",
      description: "Error setting address details",
      httpCode: 500,
    });
  }
}

async function getCardById(req, res) {
  let card;
  try {
    card = await cardSchema.findById(req.query.id).lean();
    if (card == null) {
      return res.status(200).json({
        status: "failed",
        message: "Card not found!",
      });
    }
    await setAddressDetails(card);
    res.card = card;
    res.status(200).json({
      status: "success",
      data: card,
    });
  } catch (err) {
    return res.status(200).json({
      status: "failed",
      message: err.message,
    });
  }
}

module.exports = getCardById;
