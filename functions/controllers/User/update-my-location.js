const {
  userSchema: User,
  statesSchema,
  districtSchema,
  newTehsilSchema,
  areaSchema,
  tehsilSchema,
  gramSchema,
} = require("../../models"); // Adjust the path as per your project structure
const mongoose = require("mongoose");
const { ErrorEnums } = require("../../Enums"); // Adjust the path as per your project structure

const updateMyLocation = async (req, res) => {
  try {
    const userId = req.userDetails.id; // Assuming user ID is available in req.user
    const {
      state,
      district,
      janpad,
      gramPanchayat,
      gram,
      tehsil,
      locationType,
      area, // This a text that user can enter any area name that does not exist in the database
      pinCode,
      mapLink,
    } = req.body;

    const stateExists = await statesSchema.exists({
      _id: mongoose.Types.ObjectId(state),
    });
    if (!stateExists) throw new CustomError(ErrorEnums.STATE_NOT_FOUND);
    const districtExists = await districtSchema.exists({
      _id: mongoose.Types.ObjectId(district),
    });
    if (!districtExists) throw new CustomError(ErrorEnums.DISTRICT_NOT_FOUND);

    const tehsilExists = await newTehsilSchema.exists({
      _id: mongoose.Types.ObjectId(tehsil),
    });
    if (!tehsilExists) throw new CustomError(ErrorEnums.TEHSIL_NOT_FOUND);
    const janpadExists = await tehsilSchema.exists({
      _id: mongoose.Types.ObjectId(janpad),
    });
    if (!janpadExists) throw new CustomError(ErrorEnums.JANPAD_NOT_FOUND);

    if (locationType === "Village") {
      const gramPanchayatExists = await areaSchema.exists({
        _id: mongoose.Types.ObjectId(gramPanchayat),
      });
      if (!gramPanchayatExists)
        throw new CustomError(ErrorEnums.GRAM_PANCHAYAT_NOT_FOUND);
    }

    const gramExists = await gramSchema.exists({
      _id: mongoose.Types.ObjectId(gram),
    });

    if (!gramExists) throw new CustomError(ErrorEnums.GRAM_NOT_FOUND);

    // Update user location
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          current_state: state,
          current_district: district,
          current_janpad: janpad,
          current_gram_panchayat: gramPanchayat,
          current_gram: gram,
          current_tehsil: tehsil,
          current_location_type: locationType,
          current_city: area,
          current_pincode: pinCode,
          current_maplink: mapLink || null,
        },
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({ message: "Location updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error." });
  }
};

module.exports = updateMyLocation;
