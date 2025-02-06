const hospitalSchema = require("../../models/hospital");
const DBEnums = require("../../Enums/DBEnums");
const addHospitalWithSubmittedStatus = async (req, res) => {
  try {
    let uuid;
    while (true) {
      var x = (Math.floor(Math.random() * (9999 - 1001 + 1)) + 1001)
        .toString()
        .padStart(4, "0");
      const uid = `${req.body.category
        .toString()
        .toUpperCase()
        .substring(0, 1)}${x}`;
      const qry = await hospitalSchema.exists({ uid: uid });
      console.log(qry);
      if (!qry) {
        uuid = uid;
        break;
      }
    }
    const uid = uuid;

    const hospital = new hospitalSchema({
      category: req.body.category,
      entity_name: req.body.entity_name,
      contactPersonPhone: req.body.contactPersonPhone,
      address: req.body.address,
      uid: uid,
      created_at: new Date(),
      status: DBEnums.HOSPITAL_STATUS.SUBMITTED,
    });
    await hospital.save();
    res.status(201).json({ message: "Hospital added successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = addHospitalWithSubmittedStatus;
