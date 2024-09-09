const express = require("express");
const router = express.Router();
const stateSchema = require("../models/states");
const districtSchema = require("../models/district");
const tehsilSchema = require("../models/tehsil");
const areaSchema = require("../models/area");
const gramSchema = require("../models/gram");
const cardSchema = require("../models/card");
const newTehsilSchema = require("../models/new_tehsil");

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

router.get("/:responseType", async (req, res) => {
  try {
    if (req.params.responseType == "state") {
      var qry = {};
      if (req.query.type != "ADMIN" || req.query.showHidden != "true") {
        qry.active = true;
      }
      const states = await stateSchema.find(qry);
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
        const districts = await districtSchema.find(qry);
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
        const tehsils = await newTehsilSchema.find(qry);

        let newTehsil = [];
        for (let i = 0; i < tehsils.length; i++) {
          const count = await cardSchema.countDocuments({
            tehsil: tehsils[i].name,
          });
          newTehsil.push({ ...tehsils[i]?.toObject(), count });
        }

        return res.status(200).json({
          status: "success",
          data: newTehsil,
        });
      }
    }
    if (req.params.responseType == "janPanchayat") {
      if ((req.query.districtId || "") != "") {
        var qry = { ref_id: req.query.districtId };
        if (req.query.type != "ADMIN" || req.query.showHidden != "true") {
          qry.active = true;
        }
        const tehsils = await tehsilSchema.find(qry);
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
        const areas = await areaSchema.find(qry);
        if (req.query.type == "ADMIN") {
          return res.status(200).json({
            status: "success",
            data: areas,
          });
        } else {
          var objs = Array();
          for (let area of areas) {
            const grams = await gramSchema.find({ ref_id: area._id });
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
        const areas = await areaSchema.find(qry);
        if (req.query.type == "ADMIN") {
          return res.status(200).json({
            status: "success",
            data: areas,
          });
        } else {
          var objs = Array();
          for (let area of areas) {
            const grams = await gramSchema.find({ ref_id: area._id });
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
        const areas = await gramSchema.find(qry);
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
        const gramPs = await areaSchema.find(qry);
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

// const data = {
//     "states": [
//         {
//             "state": "Andhra Pradesh",
//             "districts": [
//                 "Anantapur",
//                 "Chittoor",
//                 "East Godavari",
//                 "Guntur",
//                 "Krishna",
//                 "Kurnool",
//                 "Nellore",
//                 "Prakasam",
//                 "Srikakulam",
//                 "Visakhapatnam",
//                 "Vizianagaram",
//                 "West Godavari",
//                 "YSR Kadapa"
//             ]
//         },
//         {
//             "state": "Arunachal Pradesh",
//             "districts": [
//                 "Tawang",
//                 "West Kameng",
//                 "East Kameng",
//                 "Papum Pare",
//                 "Kurung Kumey",
//                 "Kra Daadi",
//                 "Lower Subansiri",
//                 "Upper Subansiri",
//                 "West Siang",
//                 "East Siang",
//                 "Siang",
//                 "Upper Siang",
//                 "Lower Siang",
//                 "Lower Dibang Valley",
//                 "Dibang Valley",
//                 "Anjaw",
//                 "Lohit",
//                 "Namsai",
//                 "Changlang",
//                 "Tirap",
//                 "Longding"
//             ]
//         },
//         {
//             "state": "Assam",
//             "districts": [
//                 "Baksa",
//                 "Barpeta",
//                 "Biswanath",
//                 "Bongaigaon",
//                 "Cachar",
//                 "Charaideo",
//                 "Chirang",
//                 "Darrang",
//                 "Dhemaji",
//                 "Dhubri",
//                 "Dibrugarh",
//                 "Goalpara",
//                 "Golaghat",
//                 "Hailakandi",
//                 "Hojai",
//                 "Jorhat",
//                 "Kamrup Metropolitan",
//                 "Kamrup",
//                 "Karbi Anglong",
//                 "Karimganj",
//                 "Kokrajhar",
//                 "Lakhimpur",
//                 "Majuli",
//                 "Morigaon",
//                 "Nagaon",
//                 "Nalbari",
//                 "Dima Hasao",
//                 "Sivasagar",
//                 "Sonitpur",
//                 "South Salmara-Mankachar",
//                 "Tinsukia",
//                 "Udalguri",
//                 "West Karbi Anglong"
//             ]
//         },
//         {
//             "state": "Bihar",
//             "districts": [
//                 "Araria",
//                 "Arwal",
//                 "Aurangabad",
//                 "Banka",
//                 "Begusarai",
//                 "Bhagalpur",
//                 "Bhojpur",
//                 "Buxar",
//                 "Darbhanga",
//                 "East Champaran (Motihari)",
//                 "Gaya",
//                 "Gopalganj",
//                 "Jamui",
//                 "Jehanabad",
//                 "Kaimur (Bhabua)",
//                 "Katihar",
//                 "Khagaria",
//                 "Kishanganj",
//                 "Lakhisarai",
//                 "Madhepura",
//                 "Madhubani",
//                 "Munger (Monghyr)",
//                 "Muzaffarpur",
//                 "Nalanda",
//                 "Nawada",
//                 "Patna",
//                 "Purnia (Purnea)",
//                 "Rohtas",
//                 "Saharsa",
//                 "Samastipur",
//                 "Saran",
//                 "Sheikhpura",
//                 "Sheohar",
//                 "Sitamarhi",
//                 "Siwan",
//                 "Supaul",
//                 "Vaishali",
//                 "West Champaran"
//             ]
//         },
//         {
//             "state": "Chandigarh (UT)",
//             "districts": [
//                 "Chandigarh"
//             ]
//         },
//         {
//             "state": "Chhattisgarh",
//             "districts": [
//                 "Balod",
//                 "Baloda Bazar",
//                 "Balrampur",
//                 "Bastar",
//                 "Bemetara",
//                 "Bijapur",
//                 "Bilaspur",
//                 "Dantewada (South Bastar)",
//                 "Dhamtari",
//                 "Durg",
//                 "Gariyaband",
//                 "Janjgir-Champa",
//                 "Jashpur",
//                 "Kabirdham (Kawardha)",
//                 "Kanker (North Bastar)",
//                 "Kondagaon",
//                 "Korba",
//                 "Korea (Koriya)",
//                 "Mahasamund",
//                 "Mungeli",
//                 "Narayanpur",
//                 "Raigarh",
//                 "Raipur",
//                 "Rajnandgaon",
//                 "Sukma",
//                 "Surajpur  ",
//                 "Surguja"
//             ]
//         },
//         {
//             "state": "Dadra and Nagar Haveli (UT)",
//             "districts": [
//                 "Dadra & Nagar Haveli"
//             ]
//         },
//         {
//             "state": "Daman and Diu (UT)",
//             "districts": [
//                 "Daman",
//                 "Diu"
//             ]
//         },
//         {
//             "state": "Delhi (NCT)",
//             "districts": [
//                 "Central Delhi",
//                 "East Delhi",
//                 "New Delhi",
//                 "North Delhi",
//                 "North East  Delhi",
//                 "North West  Delhi",
//                 "Shahdara",
//                 "South Delhi",
//                 "South East Delhi",
//                 "South West  Delhi",
//                 "West Delhi"
//             ]
//         },
//         {
//             "state": "Goa",
//             "districts": [
//                 "North Goa",
//                 "South Goa"
//             ]
//         },
//         {
//             "state": "Gujarat",
//             "districts": [
//                 "Ahmedabad",
//                 "Amreli",
//                 "Anand",
//                 "Aravalli",
//                 "Banaskantha (Palanpur)",
//                 "Bharuch",
//                 "Bhavnagar",
//                 "Botad",
//                 "Chhota Udepur",
//                 "Dahod",
//                 "Dangs (Ahwa)",
//                 "Devbhoomi Dwarka",
//                 "Gandhinagar",
//                 "Gir Somnath",
//                 "Jamnagar",
//                 "Junagadh",
//                 "Kachchh",
//                 "Kheda (Nadiad)",
//                 "Mahisagar",
//                 "Mehsana",
//                 "Morbi",
//                 "Narmada (Rajpipla)",
//                 "Navsari",
//                 "Panchmahal (Godhra)",
//                 "Patan",
//                 "Porbandar",
//                 "Rajkot",
//                 "Sabarkantha (Himmatnagar)",
//                 "Surat",
//                 "Surendranagar",
//                 "Tapi (Vyara)",
//                 "Vadodara",
//                 "Valsad"
//             ]
//         },
//         {
//             "state": "Haryana",
//             "districts": [
//                 "Ambala",
//                 "Bhiwani",
//                 "Charkhi Dadri",
//                 "Faridabad",
//                 "Fatehabad",
//                 "Gurgaon",
//                 "Hisar",
//                 "Jhajjar",
//                 "Jind",
//                 "Kaithal",
//                 "Karnal",
//                 "Kurukshetra",
//                 "Mahendragarh",
//                 "Mewat",
//                 "Palwal",
//                 "Panchkula",
//                 "Panipat",
//                 "Rewari",
//                 "Rohtak",
//                 "Sirsa",
//                 "Sonipat",
//                 "Yamunanagar"
//             ]
//         },
//         {
//             "state": "Himachal Pradesh",
//             "districts": [
//                 "Bilaspur",
//                 "Chamba",
//                 "Hamirpur",
//                 "Kangra",
//                 "Kinnaur",
//                 "Kullu",
//                 "Lahaul &amp; Spiti",
//                 "Mandi",
//                 "Shimla",
//                 "Sirmaur (Sirmour)",
//                 "Solan",
//                 "Una"
//             ]
//         },
//         {
//             "state": "Jammu and Kashmir",
//             "districts": [
//                 "Anantnag",
//                 "Bandipore",
//                 "Baramulla",
//                 "Budgam",
//                 "Doda",
//                 "Ganderbal",
//                 "Jammu",
//                 "Kargil",
//                 "Kathua",
//                 "Kishtwar",
//                 "Kulgam",
//                 "Kupwara",
//                 "Leh",
//                 "Poonch",
//                 "Pulwama",
//                 "Rajouri",
//                 "Ramban",
//                 "Reasi",
//                 "Samba",
//                 "Shopian",
//                 "Srinagar",
//                 "Udhampur"
//             ]
//         },
//         {
//             "state": "Jharkhand",
//             "districts": [
//                 "Bokaro",
//                 "Chatra",
//                 "Deoghar",
//                 "Dhanbad",
//                 "Dumka",
//                 "East Singhbhum",
//                 "Garhwa",
//                 "Giridih",
//                 "Godda",
//                 "Gumla",
//                 "Hazaribag",
//                 "Jamtara",
//                 "Khunti",
//                 "Koderma",
//                 "Latehar",
//                 "Lohardaga",
//                 "Pakur",
//                 "Palamu",
//                 "Ramgarh",
//                 "Ranchi",
//                 "Sahibganj",
//                 "Seraikela-Kharsawan",
//                 "Simdega",
//                 "West Singhbhum"
//             ]
//         },
//         {
//             "state": "Karnataka",
//             "districts": [
//                 "Bagalkot",
//                 "Ballari (Bellary)",
//                 "Belagavi (Belgaum)",
//                 "Bengaluru (Bangalore) Rural",
//                 "Bengaluru (Bangalore) Urban",
//                 "Bidar",
//                 "Chamarajanagar",
//                 "Chikballapur",
//                 "Chikkamagaluru (Chikmagalur)",
//                 "Chitradurga",
//                 "Dakshina Kannada",
//                 "Davangere",
//                 "Dharwad",
//                 "Gadag",
//                 "Hassan",
//                 "Haveri",
//                 "Kalaburagi (Gulbarga)",
//                 "Kodagu",
//                 "Kolar",
//                 "Koppal",
//                 "Mandya",
//                 "Mysuru (Mysore)",
//                 "Raichur",
//                 "Ramanagara",
//                 "Shivamogga (Shimoga)",
//                 "Tumakuru (Tumkur)",
//                 "Udupi",
//                 "Uttara Kannada (Karwar)",
//                 "Vijayapura (Bijapur)",
//                 "Yadgir"
//             ]
//         },
//         {
//             "state": "Kerala",
//             "districts": [
//                 "Alappuzha",
//                 "Ernakulam",
//                 "Idukki",
//                 "Kannur",
//                 "Kasaragod",
//                 "Kollam",
//                 "Kottayam",
//                 "Kozhikode",
//                 "Malappuram",
//                 "Palakkad",
//                 "Pathanamthitta",
//                 "Thiruvananthapuram",
//                 "Thrissur",
//                 "Wayanad"
//             ]
//         },
//         {
//             "state": "Lakshadweep (UT)",
//             "districts": [
//                 "Agatti",
//                 "Amini",
//                 "Androth",
//                 "Bithra",
//                 "Chethlath",
//                 "Kavaratti",
//                 "Kadmath",
//                 "Kalpeni",
//                 "Kilthan",
//                 "Minicoy"
//             ]
//         },
//         {
//             "state": "Madhya Pradesh",
//             "districts": [
//                 "Agar Malwa",
//                 "Alirajpur",
//                 "Anuppur",
//                 "Ashoknagar",
//                 "Balaghat",
//                 "Barwani",
//                 "Betul",
//                 "Bhind",
//                 "Bhopal",
//                 "Burhanpur",
//                 "Chhatarpur",
//                 "Chhindwara",
//                 "Damoh",
//                 "Datia",
//                 "Dewas",
//                 "Dhar",
//                 "Dindori",
//                 "Guna",
//                 "Gwalior",
//                 "Harda",
//                 "Hoshangabad",
//                 "Indore",
//                 "Jabalpur",
//                 "Jhabua",
//                 "Katni",
//                 "Khandwa",
//                 "Khargone",
//                 "Mandla",
//                 "Mandsaur",
//                 "Morena",
//                 "Narsinghpur",
//                 "Neemuch",
//                 "Panna",
//                 "Raisen",
//                 "Rajgarh",
//                 "Ratlam",
//                 "Rewa",
//                 "Sagar",
//                 "Satna",
//                 "Sehore",
//                 "Seoni",
//                 "Shahdol",
//                 "Shajapur",
//                 "Sheopur",
//                 "Shivpuri",
//                 "Sidhi",
//                 "Singrauli",
//                 "Tikamgarh",
//                 "Ujjain",
//                 "Umaria",
//                 "Vidisha"
//             ]
//         },
//         {
//             "state": "Maharashtra",
//             "districts": [
//                 "Ahmednagar",
//                 "Akola",
//                 "Amravati",
//                 "Aurangabad",
//                 "Beed",
//                 "Bhandara",
//                 "Buldhana",
//                 "Chandrapur",
//                 "Dhule",
//                 "Gadchiroli",
//                 "Gondia",
//                 "Hingoli",
//                 "Jalgaon",
//                 "Jalna",
//                 "Kolhapur",
//                 "Latur",
//                 "Mumbai City",
//                 "Mumbai Suburban",
//                 "Nagpur",
//                 "Nanded",
//                 "Nandurbar",
//                 "Nashik",
//                 "Osmanabad",
//                 "Palghar",
//                 "Parbhani",
//                 "Pune",
//                 "Raigad",
//                 "Ratnagiri",
//                 "Sangli",
//                 "Satara",
//                 "Sindhudurg",
//                 "Solapur",
//                 "Thane",
//                 "Wardha",
//                 "Washim",
//                 "Yavatmal"
//             ]
//         },
//         {
//             "state": "Manipur",
//             "districts": [
//                 "Bishnupur",
//                 "Chandel",
//                 "Churachandpur",
//                 "Imphal East",
//                 "Imphal West",
//                 "Jiribam",
//                 "Kakching",
//                 "Kamjong",
//                 "Kangpokpi",
//                 "Noney",
//                 "Pherzawl",
//                 "Senapati",
//                 "Tamenglong",
//                 "Tengnoupal",
//                 "Thoubal",
//                 "Ukhrul"
//             ]
//         },
//         {
//             "state": "Meghalaya",
//             "districts": [
//                 "East Garo Hills",
//                 "East Jaintia Hills",
//                 "East Khasi Hills",
//                 "North Garo Hills",
//                 "Ri Bhoi",
//                 "South Garo Hills",
//                 "South West Garo Hills ",
//                 "South West Khasi Hills",
//                 "West Garo Hills",
//                 "West Jaintia Hills",
//                 "West Khasi Hills"
//             ]
//         },
//         {
//             "state": "Mizoram",
//             "districts": [
//                 "Aizawl",
//                 "Champhai",
//                 "Kolasib",
//                 "Lawngtlai",
//                 "Lunglei",
//                 "Mamit",
//                 "Saiha",
//                 "Serchhip"
//             ]
//         },
//         {
//             "state": "Nagaland",
//             "districts": [
//                 "Dimapur",
//                 "Kiphire",
//                 "Kohima",
//                 "Longleng",
//                 "Mokokchung",
//                 "Mon",
//                 "Peren",
//                 "Phek",
//                 "Tuensang",
//                 "Wokha",
//                 "Zunheboto"
//             ]
//         },
//         {
//             "state": "Odisha",
//             "districts": [
//                 "Angul",
//                 "Balangir",
//                 "Balasore",
//                 "Bargarh",
//                 "Bhadrak",
//                 "Boudh",
//                 "Cuttack",
//                 "Deogarh",
//                 "Dhenkanal",
//                 "Gajapati",
//                 "Ganjam",
//                 "Jagatsinghapur",
//                 "Jajpur",
//                 "Jharsuguda",
//                 "Kalahandi",
//                 "Kandhamal",
//                 "Kendrapara",
//                 "Kendujhar (Keonjhar)",
//                 "Khordha",
//                 "Koraput",
//                 "Malkangiri",
//                 "Mayurbhanj",
//                 "Nabarangpur",
//                 "Nayagarh",
//                 "Nuapada",
//                 "Puri",
//                 "Rayagada",
//                 "Sambalpur",
//                 "Sonepur",
//                 "Sundargarh"
//             ]
//         },
//         {
//             "state": "Puducherry (UT)",
//             "districts": [
//                 "Karaikal",
//                 "Mahe",
//                 "Pondicherry",
//                 "Yanam"
//             ]
//         },
//         {
//             "state": "Punjab",
//             "districts": [
//                 "Amritsar",
//                 "Barnala",
//                 "Bathinda",
//                 "Faridkot",
//                 "Fatehgarh Sahib",
//                 "Fazilka",
//                 "Ferozepur",
//                 "Gurdaspur",
//                 "Hoshiarpur",
//                 "Jalandhar",
//                 "Kapurthala",
//                 "Ludhiana",
//                 "Mansa",
//                 "Moga",
//                 "Muktsar",
//                 "Nawanshahr (Shahid Bhagat Singh Nagar)",
//                 "Pathankot",
//                 "Patiala",
//                 "Rupnagar",
//                 "Sahibzada Ajit Singh Nagar (Mohali)",
//                 "Sangrur",
//                 "Tarn Taran"
//             ]
//         },
//         {
//             "state": "Rajasthan",
//             "districts": [
//                 "Ajmer",
//                 "Alwar",
//                 "Banswara",
//                 "Baran",
//                 "Barmer",
//                 "Bharatpur",
//                 "Bhilwara",
//                 "Bikaner",
//                 "Bundi",
//                 "Chittorgarh",
//                 "Churu",
//                 "Dausa",
//                 "Dholpur",
//                 "Dungarpur",
//                 "Hanumangarh",
//                 "Jaipur",
//                 "Jaisalmer",
//                 "Jalore",
//                 "Jhalawar",
//                 "Jhunjhunu",
//                 "Jodhpur",
//                 "Karauli",
//                 "Kota",
//                 "Nagaur",
//                 "Pali",
//                 "Pratapgarh",
//                 "Rajsamand",
//                 "Sawai Madhopur",
//                 "Sikar",
//                 "Sirohi",
//                 "Sri Ganganagar",
//                 "Tonk",
//                 "Udaipur"
//             ]
//         },
//         {
//             "state": "Sikkim",
//             "districts": [
//                 "East Sikkim",
//                 "North Sikkim",
//                 "South Sikkim",
//                 "West Sikkim"
//             ]
//         },
//         {
//             "state": "Tamil Nadu",
//             "districts": [
//                 "Ariyalur",
//                 "Chennai",
//                 "Coimbatore",
//                 "Cuddalore",
//                 "Dharmapuri",
//                 "Dindigul",
//                 "Erode",
//                 "Kanchipuram",
//                 "Kanyakumari",
//                 "Karur",
//                 "Krishnagiri",
//                 "Madurai",
//                 "Nagapattinam",
//                 "Namakkal",
//                 "Nilgiris",
//                 "Perambalur",
//                 "Pudukkottai",
//                 "Ramanathapuram",
//                 "Salem",
//                 "Sivaganga",
//                 "Thanjavur",
//                 "Theni",
//                 "Thoothukudi (Tuticorin)",
//                 "Tiruchirappalli",
//                 "Tirunelveli",
//                 "Tiruppur",
//                 "Tiruvallur",
//                 "Tiruvannamalai",
//                 "Tiruvarur",
//                 "Vellore",
//                 "Viluppuram",
//                 "Virudhunagar"
//             ]
//         },
//         {
//             "state": "Telangana",
//             "districts": [
//                 "Adilabad",
//                 "Bhadradri Kothagudem",
//                 "Hyderabad",
//                 "Jagtial",
//                 "Jangaon",
//                 "Jayashankar Bhoopalpally",
//                 "Jogulamba Gadwal",
//                 "Kamareddy",
//                 "Karimnagar",
//                 "Khammam",
//                 "Komaram Bheem Asifabad",
//                 "Mahabubabad",
//                 "Mahabubnagar",
//                 "Mancherial",
//                 "Medak",
//                 "Medchal",
//                 "Nagarkurnool",
//                 "Nalgonda",
//                 "Nirmal",
//                 "Nizamabad",
//                 "Peddapalli",
//                 "Rajanna Sircilla",
//                 "Rangareddy",
//                 "Sangareddy",
//                 "Siddipet",
//                 "Suryapet",
//                 "Vikarabad",
//                 "Wanaparthy",
//                 "Warangal (Rural)",
//                 "Warangal (Urban)",
//                 "Yadadri Bhuvanagiri"
//             ]
//         },
//         {
//             "state": "Tripura",
//             "districts": [
//                 "Dhalai",
//                 "Gomati",
//                 "Khowai",
//                 "North Tripura",
//                 "Sepahijala",
//                 "South Tripura",
//                 "Unakoti",
//                 "West Tripura"
//             ]
//         },
//         {
//             "state": "Uttarakhand",
//             "districts": [
//                 "Almora",
//                 "Bageshwar",
//                 "Chamoli",
//                 "Champawat",
//                 "Dehradun",
//                 "Haridwar",
//                 "Nainital",
//                 "Pauri Garhwal",
//                 "Pithoragarh",
//                 "Rudraprayag",
//                 "Tehri Garhwal",
//                 "Udham Singh Nagar",
//                 "Uttarkashi"
//             ]
//         },
//         {
//             "state": "Uttar Pradesh",
//             "districts": [
//                 "Agra",
//                 "Aligarh",
//                 "Allahabad",
//                 "Ambedkar Nagar",
//                 "Amethi (Chatrapati Sahuji Mahraj Nagar)",
//                 "Amroha (J.P. Nagar)",
//                 "Auraiya",
//                 "Azamgarh",
//                 "Baghpat",
//                 "Bahraich",
//                 "Ballia",
//                 "Balrampur",
//                 "Banda",
//                 "Barabanki",
//                 "Bareilly",
//                 "Basti",
//                 "Bhadohi",
//                 "Bijnor",
//                 "Budaun",
//                 "Bulandshahr",
//                 "Chandauli",
//                 "Chitrakoot",
//                 "Deoria",
//                 "Etah",
//                 "Etawah",
//                 "Faizabad",
//                 "Farrukhabad",
//                 "Fatehpur",
//                 "Firozabad",
//                 "Gautam Buddha Nagar",
//                 "Ghaziabad",
//                 "Ghazipur",
//                 "Gonda",
//                 "Gorakhpur",
//                 "Hamirpur",
//                 "Hapur (Panchsheel Nagar)",
//                 "Hardoi",
//                 "Hathras",
//                 "Jalaun",
//                 "Jaunpur",
//                 "Jhansi",
//                 "Kannauj",
//                 "Kanpur Dehat",
//                 "Kanpur Nagar",
//                 "Kanshiram Nagar (Kasganj)",
//                 "Kaushambi",
//                 "Kushinagar (Padrauna)",
//                 "Lakhimpur - Kheri",
//                 "Lalitpur",
//                 "Lucknow",
//                 "Maharajganj",
//                 "Mahoba",
//                 "Mainpuri",
//                 "Mathura",
//                 "Mau",
//                 "Meerut",
//                 "Mirzapur",
//                 "Moradabad",
//                 "Muzaffarnagar",
//                 "Pilibhit",
//                 "Pratapgarh",
//                 "RaeBareli",
//                 "Rampur",
//                 "Saharanpur",
//                 "Sambhal (Bhim Nagar)",
//                 "Sant Kabir Nagar",
//                 "Shahjahanpur",
//                 "Shamali (Prabuddh Nagar)",
//                 "Shravasti",
//                 "Siddharth Nagar",
//                 "Sitapur",
//                 "Sonbhadra",
//                 "Sultanpur",
//                 "Unnao",
//                 "Varanasi"
//             ]
//         },
//         {
//             "state": "West Bengal",
//             "districts": [
//                 "Alipurduar",
//                 "Bankura",
//                 "Birbhum",
//                 "Burdwan (Bardhaman)",
//                 "Cooch Behar",
//                 "Dakshin Dinajpur (South Dinajpur)",
//                 "Darjeeling",
//                 "Hooghly",
//                 "Howrah",
//                 "Jalpaiguri",
//                 "Kalimpong",
//                 "Kolkata",
//                 "Malda",
//                 "Murshidabad",
//                 "Nadia",
//                 "North 24 Parganas",
//                 "Paschim Medinipur (West Medinipur)",
//                 "Purba Medinipur (East Medinipur)",
//                 "Purulia",
//                 "South 24 Parganas",
//                 "Uttar Dinajpur (North Dinajpur)"
//             ]
//         }
//     ]
// };

// router.patch('/pushData/test', async (req, res) => {
//     console.log("STATETETET");
//     for (let a of data.states) {
//         const state = await stateSchema({
//             name: a.state
//         }).save();
//         console.log(state);
//         for (let d of a.districts) {
//             const dist = await (districtSchema({
//                 name: d,
//                 ref_id: state._id
//             })).save();
//             console.log(dist);
//         }
//     }
//     return res.status(200).json({
//         'done': true
//     });
// });

module.exports = router;
