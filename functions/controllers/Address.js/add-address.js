const {
  statesSchema,
  districtSchema,
  newTehsilSchema,
  tehsilSchema,
  areaSchema,
  gramSchema,
} = require("../../models");

const addAddress = async (req, res) => {
  try {
    const locationType = req.body.type;
    if (locationType == "state") {
      const data = statesSchema({
        name: req.body.name,
        active: req.body.active || false,
      });
      const states = await data.save();
      return res.status(200).json({
        status: "success",
        data: states,
      });
    }
    if (locationType == "district") {
      const data = districtSchema({
        name: req.body.name,
        ref_id: req.body.ref_id,
        active: req.body.active || false,
      });
      const districts = await data.save();
      return res.status(200).json({
        status: "success",
        data: districts,
      });
    }
    if (locationType == "tehsil") {
      const data = newTehsilSchema({
        name: req.body.name,
        ref_id: req.body.ref_id,
        active: req.body.active || false,
      });
      const tehsils = await data.save();
      return res.status(200).json({
        status: "success",
        data: tehsils,
      });
    }
    if (locationType == "janPanchayat") {
      const data = tehsilSchema({
        name: req.body.name,
        ref_id: req.body.ref_id,
        active: req.body.active || false,
      });
      const tehsils = await data.save();
      return res.status(200).json({
        status: "success",
        data: tehsils,
      });
    }
    if (locationType == "gramPanchayat") {
      if ((req.body.janPanchayatId || "") != "") {
        const data = areaSchema({
          name: req.body.name,
          ref_id: req.body.janPanchayatId,
          sarpanch: req.body.sarpanch,
          sachiv: req.body.sachiv,
          rojgar_sahayak: req.body.rojgar_sahayak,
          pincode: req.body.pincode,
          tehsil: req.body.tehsil,
          updated_by: req.body.updated_by,
          active: req.body.active || false,
        });

        const areas = await data.save();
        return res.status(200).json({
          status: "success",
          data: areas,
        });
      } else if ((req.body.tehsilId || "") != "") {
        console.log(req.body);
        const data = areaSchema({
          name: req.body.name,
          ref_id: req.body.tehsilId,
          sarpanch: req.body.sarpanch,
          sachiv: req.body.sachiv,
          rojgar_sahayak: req.body.rojgar_sahayak,
          pincode: req.body.pincode,
          tehsil: req.body.tehsilId,
          updated_by: req.body.updated_by,
          active: req.body.active || false,
        });

        const areas = await data.save();
        return res.status(200).json({
          status: "success",
          data: areas,
        });
      }
    }

    if (locationType == "gram") {
      const data = gramSchema({
        name: req.body.name,
        ref_id: req.body.ref_id,
        map_link: req.body.map_link,
        active: req.body.active || false,
      });
      const areas = await data.save();
      return res.status(200).json({
        status: "success",
        data: areas,
      });
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

module.exports = addAddress;
