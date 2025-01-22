const addgrams = async ({ data = [], gramPanchayatId }) => {
  const insertedIds = [];
  try {
    for (i = 0; i < data?.length; i++) {
      const g = data[i];
      const existingData = await gramSchema.findOne({
        name: g.name,
        ref_id: gramPanchayatId,
      });
      if (isEmpty(existingData)) {
        const gram = gramSchema({
          name: g.name,
          ref_id: gramPanchayatId,
          active: true,
        });
        const savedGram = await gram.save();
        insertedIds.push(savedGram._id);
      }
    }
  } catch (error) {
    console.log(`deleting grams ${insertedIds}`);
    await gramSchema.deleteMany({ _id: { $in: insertedIds } });
    throw error;
  }
};

const addGramPanChayat = async ({ data, janpadPanchyatId }) => {
  const insertedIds = [];
  try {
    for (let i = 0; i < data.length; i++) {
      const inputeGramPanchayat = data[i];
      const existingJanpadPanchayat = await areaSchema.findOne({
        name: inputeGramPanchayat.name,
        ref_id: janpadPanchyatId,
      });
      let gramPanchayatId;
      if (isEmpty(existingJanpadPanchayat)) {
        const gramPanchayat = areaSchema({
          name: inputeGramPanchayat.name,
          ref_id: janpadPanchyatId,
          rojgar_sahayak: inputeGramPanchayat.rojgar_sahayak,
          sachiv: inputeGramPanchayat.sachiv,
          sarpanch: inputeGramPanchayat.sarpanch,
          pincode: "",
          active: true,
        });
        const gramPanchayatData = await gramPanchayat.save();
        gramPanchayatId = gramPanchayatData._id.toString();
        insertedIds.push(gramPanchayatData._id);
      } else {
        gramPanchayatId = existingJanpadPanchayat._id.toString();
      }
      await addgrams({
        data: inputeGramPanchayat.gram,
        gramPanchayatId: gramPanchayatId,
      });
    }
  } catch (error) {
    console.log(`deleting GramPanChayat ${insertedIds}`);
    await areaSchema.deleteMany({ _id: { $in: insertedIds } });
    throw error;
  }
};

const addJanpadPanchayat = async ({ data, districtId }) => {
  const insertedIds = [];
  try {
    for (let i = 0; i < data.length; i++) {
      const jpInputeData = data[i];
      const existingJanpadPanchayat = await tehsilSchema.findOne({
        name: jpInputeData.name,
        ref_id: districtId,
      });
      let jpId;
      if (isEmpty(existingJanpadPanchayat)) {
        const jp = tehsilSchema({
          name: jpInputeData.name,
          ref_id: districtId,
          active: true,
        });
        const jpData = await jp.save();
        jpId = jpData._id.toString();
        insertedIds.push(jpData._id);
        console.log(`addded JanpadPanchayat ${jpInputeData.name}`);
      } else {
        jpId = existingJanpadPanchayat._id.toString();
      }
      if (!jpId) {
        console.log("JanpadPanchayat Id not found. for disId", districtId);

        throw new Error("JanpadPanchayat Id not found.");
      }
      await addGramPanChayat({
        data: jpInputeData.gramPanchayat,
        janpadPanchyatId: jpId,
      });
    }
  } catch (error) {
    console.log(`deleting JanpadPanchayat ${insertedIds}`);
    await tehsilSchema.deleteMany({ _id: { $in: insertedIds } });
    throw error;
  }
};

const addDistricts = async ({ data, stateId, skip = [] }) => {
  const insertedIds = [];
  try {
    for (let i = 0; i < data.length; i++) {
      const dis = data[i];
      const existingDistrict = await districtSchema.findOne({
        name: dis.district,
        ref_id: stateId,
      });
      let disId;
      if (isEmpty(existingDistrict) && !skip.includes("district")) {
        const district = districtSchema({
          name: dis.district,
          ref_id: stateId,
          active: true,
        });
        const districtData = await district.save();
        disId = districtData._id.toString();
        insertedIds.push(districtData._id);
      } else {
        disId = existingDistrict?._id.toString();
      }
      if (disId) {
        await addJanpadPanchayat({
          data: dis.janpadPanchyat,
          districtId: disId,
        });
      } else {
        throw new Error("No district found");
      }
    }
  } catch (error) {
    console.log(`deleting districts ${insertedIds}`);
    await districtSchema.deleteMany({ _id: { $in: insertedIds } });
    throw error;
  }
};

const addLocations = async (req, res) => {
  try {
    if (req.body.token == null) {
      return res.status(200).json({
        status: "failed",
        message: "Missing Token",
      });
    }
    const token = await tokenSch.findOne({ token: req.body.token });
    if (token == null) {
      return res.status(200).json({
        status: "failed",
        message: "Invalid Token",
      });
    }

    const user = await userSch.findById(token.uid);
    if (user == null || user.status != "Verified" || user.role != "ADMIN") {
      return res.status(200).json({
        status: "failed",
        message:
          user == null ? "Access Denied" : `${user.status} User: Access Denied`,
      });
    }
    await addDistricts({
      data: req.body.data,
      stateId: "63c681806072b29c2133326e",
      skip: req.body?.options?.skip,
    });
    return res.status(200).json({
      status: "success",
      message: "Done",
    });
  } catch (error) {
    return res.status(400).json({
      status: "failed",
      message: error?.message || "failed to add location.",
    });
  }
};

module.exports = addLocations;
