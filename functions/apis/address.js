const express = require("express");
const router = express.Router();
const stateSchema = require("../models/states");
const tokenSch = require("../models/token");
const userSch = require("../models/user");
const districtSchema = require("../models/district");
const tehsilSchema = require("../models/tehsil");
const areaSchema = require("../models/area");
const gramSchema = require("../models/gram");
const cardSchema = require("../models/card");
const newTehsilSchema = require("../models/new_tehsil");
const mongoose = require("mongoose");
const { sortBy, isEmpty } = require("lodash");

router.get("/upload/data", async (req, res) => {
  await areaSchema.updateMany(
    { active: false },
    {
      active: true,
    }
  );
  return res.status(200).json({
    success: true,
  });
  const buffer = ``;
  const dist = "63c681836072b29c213332b2";
  const list = buffer
    .toString()
    .split("\n")
    .map((x) => x.trim());
  const header = list[0].split(",");
  var objs = new Array();
  try {
    var prevValue = {};
    for (let i = 1; i < list.length; i++) {
      var dx = {};
      const vx = list[i].split(",");
      for (let x = 0; x < header.length; x++) {
        if (x < vx.length) {
          if (vx[x].toString().trim() == "") {
            dx[header[x]] = prevValue[header[x]];
          } else {
            dx[header[x]] = vx[x].toString().trim();
            prevValue[header[x]] = vx[x].toString().trim();
          }
        }
      }
      objs.push(dx);
    }
  } catch (err) {
    console.log(err);
  }
  // var added = Array();
  // for (let x of objs) {
  //     const jpd = await tehsilSchema.findOne({
  //         name: {
  //             $regex: x['Janpad Panchayat'],
  //             $options: 'i'
  //         }
  //     });
  //     x.ref_id = jpd._id.toString();
  //     if (added.filter((a) => (a['Gram Panchayat'] == x['Gram Panchayat']) && (a.ref_id == x.ref_id)).length == 0) {
  //         added.push(x);
  //         console.log(x);
  //     }
  // }
  // for (let dd of added.map((e) => {
  //     return {
  //         name: e['Gram Panchayat'],
  //         ref_id: e.ref_id,
  //         sarpanch: {
  //             "name": e["Sarpanch"],
  //             "phone": e["Mob1"]
  //         },
  //         sachiv: {
  //             "name": e["Sachiv"],
  //             "phone": e["Mob2"]
  //         },
  //         rojgar_sahayak: {
  //             "name": e["Rojgar Sahayak"],
  //             "phone": e["Mob3"]
  //         },
  //     };
  // })) {
  //     const dxx = await areaSchema.create(dd);
  //     console.log(dd);
  // }
  // return res.status(200).json({
  //     'data': added.map((e) => {
  //         return {
  //             'name': e['Gram Panchayat'],
  //             'ref_id': e.ref_id,
  //             sarpanch: {
  //                 "name": e["Sarpanch"],
  //                 "phone": e["Mob1"]
  //             },
  //             sachiv: {
  //                 "name": e["Sachiv"],
  //                 "phone": e["Mob2"]
  //             },
  //             rojgar_sahayak: {
  //                 "name": e["Rojgar Sahayak"],
  //                 "phone": e["Mob3"]
  //             },
  //         };
  //     })
  // });
  var added = Array();
  for (let x of objs) {
    const jpd = await tehsilSchema.findOne({
      name: {
        $regex: x["Janpad Panchayat"],
        $options: "i",
      },
    });
    x.ref_id = jpd._id.toString();
    const area = await areaSchema.findOne({
      ref_id: x.ref_id,
      name: x["Gram Panchayat"],
    });
    console.log(area);
    x.id = area._id.toString();
    added.push(x);
  }
  for (let dd of added.map((e) => {
    return {
      name: e["Gram"],
      ref_id: e.id,
    };
  })) {
    const dxx = await gramSchema.create(dd);
    console.log(dxx);
  }
  return res.status(200).json({
    data: added.map((e) => {
      return {
        name: e["Gram"],
        ref_id: e.id,
      };
    }),
  });
});

router.get("/all-get-janpanchyat", async (req, res) => {
  console.log("tehsils ----");
  const tehsils = await tehsilSchema.find({ active: true });
  console.log("tehsils", tehsils);

  return res.status(200).json({
    status: "success",
    data: tehsils,
  });
});

router.get("/:responseType", async (req, res) => {
  try {
    if (req.params.responseType == "state") {
      var qry = {};
      if (req.query.type != "ADMIN" || req.query.showHidden != "true") {
        qry.active = true;
      }
      const states = await stateSchema.find(qry).sort({ name: 1 });
      return res.status(200).json({
        status: "success",
        data: states,
      });
    }
    if (req.params.responseType == "district") {
      if ((req.query.stateId || "") != "") {
        var qry = { ref_id: req.query.stateId };
        if (req.query.type != "ADMIN" || req.query.showHidden != "true") {
          qry.active = true;
        }
        const districts = await districtSchema.find(qry).sort({ name: 1 });
        return res.status(200).json({
          status: "success",
          data: districts,
        });
      } else {
        var qry = {};
        if (req.query.type != "ADMIN" || req.query.showHidden != "true") {
          qry.active = true;
        }
        const districts = await districtSchema.find(qry).sort({ name: 1 });
        return res.status(200).json({
          status: "success",
          data: districts,
        });
      }
    }
    if (req.params.responseType == "tehsil") {
      if ((req.query.districtId || "") != "") {
        var qry = { ref_id: req.query.districtId };
        if (req.query.type != "ADMIN" || req.query.showHidden != "true") {
          qry.active = true;
        }
        const tehsils = await newTehsilSchema.find(qry).sort({ name: 1 });

        let newTehsil = [];
        for (let i = 0; i < tehsils.length; i++) {
          const count = await cardSchema.countDocuments({
            tehsil: tehsils[i].name,
          });
          newTehsil.push({ ...tehsils[i]?.toObject(), count });
        }

        return res.status(200).json({
          status: "success",
          data: sortBy(newTehsil, "count").reverse(),
        });
      }
    }
    if (req.params.responseType == "janPanchayat") {
      if ((req.query.districtId || "") != "") {
        var qry = { ref_id: req.query.districtId };
        if (req.query.type != "ADMIN" || req.query.showHidden != "true") {
          qry.active = true;
        }
        const tehsils = await tehsilSchema.find(qry).sort({ name: 1 });
        return res.status(200).json({
          status: "success",
          data: tehsils,
        });
      }
    }
    if (req.params.responseType == "gramPanchayat") {
      if ((req.query.janPanchayatId || "") != "") {
        var qry = { ref_id: req.query.janPanchayatId };
        if (req.query.type != "ADMIN" || req.query.showHidden != "true") {
          qry.active = true;
        }
        const areas = await areaSchema.find(qry).sort({ name: 1 });
        if (req.query.type == "ADMIN") {
          return res.status(200).json({
            status: "success",
            data: areas,
          });
        } else {
          var objs = Array();
          for (let area of areas) {
            const grams = await gramSchema
              .find({ ref_id: area._id })
              .sort({ name: 1 });
            var gms = Array();
            for (let gm of grams) {
              gm.grampanchayat_name = area.name;
              gms.push(gm);
            }
            area.grams = gms;
            objs.push(area);
          }
          return res.status(200).json({
            status: "success",
            data: objs,
          });
        }
      } else if ((req.query.tehsilId || "") != "") {
        var qry = {
          $or: [{ tehsil: req.query.tehsilId }, { ref_id: req.query.tehsilId }],
        };
        if (req.query.type != "ADMIN" || req.query.showHidden != "true") {
          qry.active = true;
        }
        const areas = await areaSchema.find(qry).sort({ name: 1 });
        if (req.query.type == "ADMIN") {
          return res.status(200).json({
            status: "success",
            data: areas,
          });
        } else {
          var objs = Array();
          for (let area of areas) {
            const grams = await gramSchema
              .find({ ref_id: area._id })
              .sort({ name: 1 });
            var gms = Array();
            for (let gm of grams) {
              gm.grampanchayat_name = area.name;
              gms.push(gm);
            }
            area.grams = gms;
            objs.push(area);
          }
          return res.status(200).json({
            status: "success",
            data: objs,
          });
        }
      }
    }
    if (req.params.responseType == "gram") {
      if ((req.query.gramPanchayatId || "") != "") {
        var qry = { ref_id: req.query.gramPanchayatId };
        if (req.query.type != "ADMIN" || req.query.showHidden != "true") {
          qry.active = true;
        }
        console.log(qry);
        const areas = await gramSchema.find(qry).sort({ name: 1 });
        return res.status(200).json({
          status: "success",
          data: areas,
        });
      } else if ((req.query.tehsilId || "") != "") {
        var qry = {
          $or: [{ tehsil: req.query.tehsilId }, { ref_id: req.query.tehsilId }],
        };
        if (req.query.type != "ADMIN" || req.query.showHidden != "true") {
          qry.active = true;
        }
        const gramPs = await areaSchema.find(qry).sort({ name: 1 });
        var objs = Array();
        for (let x of gramPs) {
          const grams = await gramSchema
            .find({ ref_id: x._id, active: true })
            .sort({ name: 1 });
          for (let y of grams) {
            y.grampanchayat_name = x.name;
            objs.push(y);
          }
        }
        return res.status(200).json({
          status: "success",
          data: objs,
        });
      }
    }
    return res.status(200).json({
      status: "failed",
      message: "No results found!",
    });
  } catch (err) {
    console.log(err.message);
    return res.status(200).json({
      status: "failed",
      message: "Failed to get settings",
    });
  }
});

router.post("/:responseType", async (req, res) => {
  try {
    if (req.params.responseType == "state") {
      const data = stateSchema({
        name: req.body.name,
        active: req.body.active || false,
      });
      const states = await data.save();
      return res.status(200).json({
        status: "success",
        data: states,
      });
    }
    if (req.params.responseType == "district") {
      if ((req.body.stateId || "") != "") {
        const data = districtSchema({
          name: req.body.name,
          ref_id: req.body.stateId,
          active: req.body.active || false,
        });
        const districts = await data.save();
        return res.status(200).json({
          status: "success",
          data: districts,
        });
      }
    }
    if (req.params.responseType == "tehsil") {
      if ((req.body.districtId || "") != "") {
        const data = newTehsilSchema({
          name: req.body.name,
          ref_id: req.body.districtId,
          active: req.body.active || false,
        });
        const tehsils = await data.save();
        return res.status(200).json({
          status: "success",
          data: tehsils,
        });
      }
    }
    if (req.params.responseType == "janPanchayat") {
      if ((req.body.districtId || "") != "") {
        const data = tehsilSchema({
          name: req.body.name,
          ref_id: req.body.districtId,
          active: req.body.active || false,
        });
        const tehsils = await data.save();
        return res.status(200).json({
          status: "success",
          data: tehsils,
        });
      }
    }
    if (req.params.responseType == "gramPanchayat") {
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

    if (req.params.responseType == "gram") {
      if ((req.body.gramPanchayatId || "") != "") {
        const data = gramSchema({
          name: req.body.name,
          ref_id: req.body.gramPanchayatId,
          map_link: req.body.map_link,
          active: req.body.active || false,
        });
        const areas = await data.save();
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
});

router.patch("/:responseType", async (req, res) => {
  try {
    var qry = {};

    if (req.params.responseType == "state") {
      if (req.body.name != null) {
        qry.name = req.body.name;
      }
      if (req.body.active != null) {
        qry.active = req.body.active;
      }
      const states = await stateSchema.findByIdAndUpdate(req.body.id, qry);
      return res.status(200).json({
        status: "success",
        data: states,
      });
    }
    if (req.params.responseType == "district") {
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
    if (req.params.responseType == "tehsil") {
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
    if (req.params.responseType == "janPanchayat") {
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
    if (req.params.responseType == "gramPanchayat") {
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
    if (req.params.responseType == "gram") {
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
});

module.exports = router;
