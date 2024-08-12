// const Roommate = require("../models/roommateModel");
// const Apartment = require("../models/apartmentModel");
// const Question = require("../models/questionModel");
// const calculateCompatibilityScore = require("../utils/matchingAlgorithm");

// exports.getMatches = async (req, res) => {
//   try {
//     if (!req.session.profile) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     const roommateId = req.session.profile;
//     const roommate = await Roommate.findById(roommateId).populate("questionnaire");

//     if (!roommate) {
//       return res.status(404).json({ message: "Roommate profile not found" });
//     }

//     const matches = await Promise.all(roommate.matches.map((matchId) =>
//       Apartment.findById(matchId).populate("questionnaire")
//     ));

//     const rvMatches = matches
//       .map((match) => {
//         let compatibilityScore = 0;
//         let distance = 0;

//         try {
//           compatibilityScore = calculateCompatibilityScore(
//             roommate.questionnaire,
//             match.questionnaire
//           );

//           if (roommate.preferences?.location?.address?.coordinates && match.info?.location?.coordinates) {
//             distance = calculateDistance(
//               roommate.preferences.location.address.coordinates,
//               match.info.location.coordinates
//             );
//           }
//         } catch (error) {
//           console.error("Error calculating scores:", error);
//         }

//         return {
//           match,
//           matchInfo: {
//             image: match.info?.images[0],
//             score: compatibilityScore,
//             title : match.info?.location.address.street + ", "+match.info.location.address.city ,
//             subTitle: match.info?.financials?.rent + "₪ /m" || 0,
//             distance,
//           },
//         };
//       })
//       .sort((a, b) => b.score - a.score);

//     res.json(rvMatches);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };
// exports.getSuggestions = async (req, res) => {
//   try {
//     if (!req.session.profile) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const roommateId = req.session.profile;

//     // Fetch the roommate's data, including questionnaire and preferences
//     const roommate = await Roommate.findById(roommateId).populate(
//       "questionnaire"
//     );
//     if (!roommate) {
//       return res.status(404).json({ message: "Roommate profile not found" });
//     }

//     // Fetch all apartments
//     const apartments = await Apartment.find().populate("questionnaire");

//     // Calculate compatibility scores and filter based on preferences
//     const compatibleApartments = apartments
//       .map((apartment) => {
//         // Check if the apartment matches the roommate's preferences
//         // if (!matchesPreferences(roommate.preferences, apartment)) {
//         //   console.log("Does not match preferences");
//         //   return null;
//         // }

//         // Calculate compatibility score
//         const compatibilityScore = calculateCompatibilityScore(
//           roommate.questionnaire,
//           apartment.questionnaire
//         );

//         const distance =
//           calculateDistance(
//             roommate.preferences?.location.address.coordinates,
//             apartment.info.location.coordinates
//           ) || 0;

//         // Return a new object with apartment data and compatibility score
//         const rv = {
//           apartment,
//           score: compatibilityScore,
//           sortOption: {
//             score: compatibilityScore,
//             rent: apartment.info.financials.rent,
//             distance,
//             date: apartment.info.leaseTerms.availableFrom,
//           },
//         };
//         return rv;
//       })
//       .sort((a, b) => b.score - a.score); // Sort by compatibility score (highest first)

//     res.json(compatibleApartments);
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Internal server error" });
//   }
// }

// exports.updateUser = async (req, res) => {
//   try {
//     if (!req.session.profile) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     let updatedUser;
//     const { questionnaire, ...otherFields } = req.body;

//     if (questionnaire) {
//       const questionnaireId = questionnaire._id;
//       const updatedQuestionnaire = await Question.findByIdAndUpdate(
//         questionnaireId,
//         questionnaire,
//         { new: true, runValidators: true }
//       );

//       if (!updatedQuestionnaire) {
//         return res.status(404).json({ message: "Questionnaire not found" });
//       }

//       updatedUser = await Roommate.findByIdAndUpdate(
//         req.session.profile,
//         { questionnaire: updatedQuestionnaire._id, ...otherFields },
//         { new: true, runValidators: true }
//       ).populate('questionnaire');
//     } else {
//       updatedUser = await Roommate.findByIdAndUpdate(
//         req.session.profile,
//         otherFields,
//         { new: true, runValidators: true }
//       ).populate('questionnaire');
//     }

//     if (!updatedUser) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     res.json(updatedUser);
//   } catch (err) {
//     console.error(err);
//     if (err.name === 'ValidationError') {
//       return res.status(400).json({ message: "Validation error", errors: err.errors });
//     }
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

// exports.setRoommatePreferences = async (req, res) => {
//   try {
//     if (!req.session.profile) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const roommateId = req.session.profile;

//     const {
//       overview = undefined,
//       details = undefined,
//       leaseDuration = undefined,
//       location = undefined,
//     } = req.body;

//     if (leaseDuration) {
//       leaseDuration.moveInDateStart = new Date(leaseDuration.moveInDateStart);
//     }

//     console.log(overview, details, location, leaseDuration);
//     const updatedRoommate = await Roommate.findByIdAndUpdate(
//       roommateId,
//       { preferences: { overview, details, location, leaseDuration } },
//       { new: true, runValidators: true }
//     );
//     updatedRoommate.save();
//     console.log(updatedRoommate);

//     if (!updatedRoommate) {
//       return res.status(404).json({ message: "Roommate not found" });
//     }

//     res.status(200).json({
//       message: "Roommate preferences updated successfully",
//       roommate: updatedRoommate,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Error updating roommate preferences" });
//   }
// };

// exports.roommateActions = async (req, res) => {
//   try {
//     const { apartmentId } = req.params;
//     const { action } = req.query;
//     const roommateId = req.session.profile;

//     if (!req.session.profile) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }
//     const roommate = await Roommate.findById(roommateId);
//     if (!roommate) {
//       return res.status(404).json({ message: "roommate not found" });
//     }

//     const apartment = await Apartment.findById(apartmentId);
//     if (!apartment) {
//       return res.status(404).json({ message: "Apartment not found" });
//     }

//     switch (action) {
//       case "like":
//         if (roommate.likes.includes(apartment._id)) {
//           return res.status(201).json({ message: "Already liked" });
//         }
//         if (roommate.dislikes.includes(apartment._id)) {
//           roommate.dislikes.pull(apartment._id);
//         }
//         roommate.likes.push(apartment._id);
//         break;
//       case "dislike":
//         if (roommate.dislikes.includes(apartment._id)) {
//           return res.status(400).json({ message: "Already disliked" });
//         }
//         if (roommate.likes.includes(apartment._id)) {
//           roommate.likes.pull(apartment._id);
//         }
//         roommate.dislikes.push(apartment._id);
//         break;
//       case "unlike":
//         if (!roommate.likes.includes(apartment._id)) {
//           return res.status(400).json({ message: "Not liked" });
//         }
//         roommate.likes.pull(apartment._id);
//         break;

//       default:
//         return res.status(400).json({ message: "Invalid action" });
//     }

//     await roommate.save();
//     return res.json({ message: "Action successful" });
//   } catch (err) {
//     console.error(err);
//     return res.status(500).json({ message: "Internal server error" });
//   }
// };

// function matchesPreferences(roommatePreferences, apartment) {
//   // Check if the apartment matches the roommate's preferences
//   if (
//     roommatePreferences.rentRange &&
//     apartment.info.financials.rent > roommatePreferences.rentRange
//   ) {
//     return false;
//   }
//   if (
//     roommatePreferences.bedrooms &&
//     apartment.info.specifications.bedrooms < roommatePreferences.bedrooms
//   ) {
//     return false;
//   }
//   if (
//     roommatePreferences.bathrooms &&
//     apartment.info.specifications.bathrooms < roommatePreferences.bathrooms
//   ) {
//     return false;
//   }
//   if (
//     roommatePreferences.minSize &&
//     apartment.info.specifications.size < roommatePreferences.minSize
//   ) {
//     return false;
//   }

//   // Check location preferences if set
//   if (roommatePreferences.address && roommatePreferences.radius) {
//     const distance = calculateDistance(
//       roommatePreferences.address.coordinates,
//       apartment.info.location.coordinates
//     );
//     if (distance > roommatePreferences.radius) {
//       return false;
//     }
//   }

//   // Check other details preferences
//   for (const [key, value] of Object.entries(roommatePreferences.details)) {
//     if (value && !apartment.details[key]) {
//       return false;
//     }
//   }

//   return true;
// }

// function calculateDistance(coord1, coord2) {
//   if (!coord1 || !coord2) {
//     return null;
//   }
//   return Math.abs(coord1[0] - coord2[0]) + Math.abs(coord1[1] - coord2[1]);
// }

const Apartment = require("../models/apartmentModel");
const Question = require("../models/questionModel");
const Roommate = require("../models/roommateModel");
const calculateCompatibilityScore = require("../utils/matchingAlgorithm");

exports.getMatches = async (req, res) => {
  try {
    const roommate = req.user;
    const matches = await Promise.all(
      roommate.matches.map((matchId) =>
        Apartment.findById(matchId).populate("questionnaire")
      )
    );

    const formattedMatches = matches
      .map((match) => {
        const compatibilityScore = calculateCompatibilityScore(
          roommate.questionnaire,
          match.questionnaire
        );
        const distance = calculateDistance(
          roommate.preferences?.location?.address?.coordinates,
          match.info?.location?.coordinates
        );

        return {
          match,
          matchInfo: {
            image: match.info?.images[0],
            score: compatibilityScore,
            title: `${match.info?.location.address.street}, ${match.info.location.address.city}`,
            subTitle: `${match.info?.financials?.rent}₪ /m`,
            distance,
          },
        };
      })
      .sort((a, b) => b.matchInfo.score - a.matchInfo.score);

    res.json(formattedMatches);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const roommate = req.user;

    const formatApartments = async (apartmentIds) => {
      const apartments = await Promise.all(
        apartmentIds.map((id) =>
          Apartment.findById(id).populate("questionnaire")
        )
      );

      return apartments.map((apartment) => {
        const compatibilityScore = calculateCompatibilityScore(
          roommate.questionnaire,
          apartment.questionnaire
        );

        return {
          apartment,
          score: compatibilityScore,
        };
      });
    };

    const likes = await formatApartments(roommate.likes);
    const dislikes = await formatApartments(roommate.dislikes);

    res.json({ likes, dislikes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const roommate = req.user;
    const apartments = await Apartment.find().populate("questionnaire");

    const compatibleApartments = apartments
      .filter(
        (apartment) =>
          !roommate.dislikes.includes(apartment._id) &&
          !roommate.likes.includes(apartment._id) &&
          !roommate.matches.includes(apartment._id)
      )
      // .filter((apartment) => {
      //   matchesPreferences(roommate.preferences, apartment);
      // })
      .map((apartment) => {
        const compatibilityScore = calculateCompatibilityScore(
          roommate.questionnaire,
          apartment.questionnaire
        );

        const distance = calculateDistance(
          roommate.preferences?.location?.address?.coordinates,
          apartment.info?.location?.coordinates
        );

        return {
          apartment,
          score: compatibilityScore,
          sortOption: {
            score: compatibilityScore,
            rent: apartment.info.financials.rent,
            distance,
            date: apartment.info.leaseTerms.availableFrom,
          },
        };
      })
      .sort((a, b) => b.score - a.score);

    res.json(compatibleApartments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { questionnaire, ...otherFields } = req.body;
    let updatedUser = req.user;

    if (questionnaire) {
      const questionnaireId = questionnaire._id;
      const updatedQuestionnaire = await Question.findByIdAndUpdate(
        questionnaireId,
        questionnaire,
        { new: true, runValidators: true }
      );
      if (!updatedQuestionnaire) {
        return res.status(404).json({ message: "Questionnaire not found" });
      }
      updatedUser = await Roommate.findByIdAndUpdate(
        updatedUser._id,
        { questionnaire: updatedQuestionnaire._id, ...otherFields },
        { new: true, runValidators: true }
      ).populate("questionnaire");
    } else {
      updatedUser = await Roommate.findByIdAndUpdate(
        req.user._id,
        otherFields,
        { new: true, runValidators: true }
      ).populate("questionnaire");
    }

    if (!updatedUser) {
      return res.status(404).json({ message: "Failed to update" });
    }

    res.json(updatedUser);
  } catch (err) {
    console.error(err);
    if (err.name === "ValidationError") {
      return res
        .status(400)
        .json({ message: "Validation error", errors: err.errors });
    }
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.setRoommatePreferences = async (req, res) => {
  try {
    const roommate = req.user;
    const roommateId = roommate._id;
    let {
      overview = undefined,
      details = undefined,
      leaseDuration = undefined,
      location = undefined,
    } = req.body;

    // details = Object.keys(details)
    // .filter((key) => details[key] === true)
    // .reduce((acc, key) => {
    //   acc[key] = true;
    //   return acc;
    // }, {});
  
  // Check if location address is empty or not properly defined
  if (!location.address || !location.address.street || !location.address.city) {
    location = undefined;
  }
  
  // Safely convert moveInDateStart to a Date object if it exists
  if (leaseDuration && leaseDuration.moveInDateStart) {
    leaseDuration.moveInDateStart = new Date(leaseDuration.moveInDateStart);
  }
  
  console.log(overview);
  console.log(details);
  console.log(location);
  console.log(leaseDuration);

    const updatedRoommate = await Roommate.findByIdAndUpdate(
      roommateId,
      { preferences: { overview, details, location, leaseDuration } },
      { new: true, runValidators: true }
    );

    if (!updatedRoommate) {
      return res.status(404).json({ message: "Roommate not found" });
    }

    res.status(200).json({
      message: "Roommate preferences updated successfully",
      roommate: roommate,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating roommate preferences" });
  }
};

exports.roommateActions = async (req, res) => {
  try {
    const { targetId } = req.params;
    const { action } = req.query;
    const roommate = req.user;
    console.log(targetId, action);

    const apartment = await Apartment.findById(targetId);
    if (!apartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    switch (action) {
      case "like":
        if (!roommate.likes.includes(apartment._id)) {
          console.log("like");
          roommate.likes.push(apartment._id);
          roommate.dislikes = roommate.dislikes.filter(
            (id) => !id.equals(apartment._id)
          );
        }
        break;
      case "dislike":
        if (!roommate.dislikes.includes(apartment._id)) {
          console.log("dislike");
          roommate.dislikes.push(apartment._id);
          roommate.likes = roommate.likes.filter(
            (id) => !id.equals(apartment._id)
          );
        }
        break;

      default:
        console.log("Invalid action");
        return res.status(400).json({ message: "Invalid action" });
    }

    await roommate.save();
    return res.json({ message: "Action successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

function calculateDistance(coord1, coord2) {
  if (!coord1 || !coord2) {
    return null;
  }
  return Math.abs(coord1[0] - coord2[0]) + Math.abs(coord1[1] - coord2[1]);
}

function matchesPreferences(roommatePreferences, apartment) {
  // Check if the apartment matches the roommate's preferences
  if (
    roommatePreferences.rentRange &&
    apartment.info.financials.rent > roommatePreferences.rentRange
  ) {
    return false;
  }
  if (
    roommatePreferences.bedrooms &&
    apartment.info.specifications.bedrooms < roommatePreferences.bedrooms
  ) {
    return false;
  }
  if (
    roommatePreferences.bathrooms &&
    apartment.info.specifications.bathrooms < roommatePreferences.bathrooms
  ) {
    return false;
  }
  if (
    roommatePreferences.minSize &&
    apartment.info.specifications.size < roommatePreferences.minSize
  ) {
    return false;
  }

  // Check location preferences if set
  if (roommatePreferences.address && roommatePreferences.radius) {
    const distance = calculateDistance(
      roommatePreferences.address.coordinates,
      apartment.info.location.coordinates
    );
    if (distance > roommatePreferences.radius) {
      return false;
    }
  }

  // Check other details preferences
  for (const [key, value] of Object.entries(roommatePreferences.details)) {
    if (value && !apartment.details[key]) {
      return false;
    }
  }

  return true;
}
