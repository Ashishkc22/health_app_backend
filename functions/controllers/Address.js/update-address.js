const {
  statesSchema,
  districtSchema,
  newTehsilSchema,
  tehsilSchema,
  areaSchema,
  gramSchema,
} = require("../../models");

const updateAddress = async (req, res) => {
  try {
    const locationType = req.body.type;
    var qry = {};

    if (locationType == "state") {
      if (req.body.name != null) {
        qry.name = req.body.name;
      }
      if (req.body.active != null) {
        qry.active = req.body.active;
      }
      const states = await statesSchema.findByIdAndUpdate(req.body.id, qry);
      return res.status(200).json({
        status: "success",
        data: states,
      });
    }
    if (locationType == "district") {
      if ((req.body.id || "") != "") {
        if (req.body.name != null) {
          qry.name = req.body.name;
        }
        if (req.body.active != null) {
          qry.active = req.body.active;
        }
        const districts = await districtSchema.findByIdAndUpdate(
          req.body.id,
          qry
        );
        return res.status(200).json({
          status: "success",
          data: districts,
        });
      }
    }
    if (locationType == "tehsil") {
      if ((req.body.id || "") != "") {
        if (req.body.name != null) {
          qry.name = req.body.name;
        }
        if (req.body.active != null) {
          qry.active = req.body.active;
        }
        const tehsils = await newTehsilSchema.findByIdAndUpdate(
          req.body.id,
          qry
        );
        return res.status(200).json({
          status: "success",
          data: tehsils,
        });
      }
    }
    if (locationType == "janPanchayat") {
      if ((req.body.id || "") != "") {
        if (req.body.name != null) {
          qry.name = req.body.name;
        }
        if (req.body.active != null) {
          qry.active = req.body.active;
        }
        const tehsils = await tehsilSchema.findByIdAndUpdate(req.body.id, qry);
        return res.status(200).json({
          status: "success",
          data: tehsils,
        });
      }
    }
    if (locationType == "gramPanchayat") {
      if ((req.body.id || "") != "") {
        if (req.body.name != null) {
          qry.name = req.body.name;
        }
        if (req.body.active != null) {
          qry.active = req.body.active;
        }
        if (req.body.sarpanch != null) {
          qry.sarpanch = req.body.sarpanch;
        }
        if (req.body.sachiv != null) {
          qry.sachiv = req.body.sachiv;
        }
        if (req.body.rojgar_sahayak != null) {
          qry.rojgar_sahayak = req.body.rojgar_sahayak;
        }
        if (req.body.pincode != null) {
          qry.pincode = req.body.pincode;
        }
        if (req.body.tehsil != null) {
          qry.tehsil = req.body.tehsil;
        }
        if (req.body.updated_by != null) {
          qry.updated_by = req.body.updated_by;
        }
        if (req.body.verified != null) {
          qry.verified = req.body.verified.toString() == "true";
        }
        const areas = await areaSchema.findByIdAndUpdate(req.body.id, qry);
        return res.status(200).json({
          status: "success",
          data: areas,
        });
      }
    }
    if (locationType == "gram") {
      if ((req.body.id || "") != "") {
        if (req.body.name != null) {
          qry.name = req.body.name;
        }
        if (req.body.active != null) {
          qry.active = req.body.active;
        }
        if (req.body.map_link != null) {
          qry.map_link = req.body.map_link;
        }
        const areas = await gramSchema.findByIdAndUpdate(req.body.id, qry);
        return res.status(200).json({
          status: "success",
          data: areas,
        });
      }
    }
    return res.status(200).json({
      status: "failed",
      message: "No results found!",
    });
  } catch (err) {
    console.log(`ERROR: ${err.message}`);
    return res.status(200).json({
      status: "failed",
      message: "Invalid Data",
    });
  }
};
module.exports = updateAddress;
