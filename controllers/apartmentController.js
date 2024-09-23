const Roommate = require("../models/roommateModel");
const Apartment = require("../models/apartmentModel");
const Question = require("../models/questionModel");
const calculateCompatibilityScore = require("../utils/matchingAlgorithm");

exports.getMatches = async (req, res) => {
  try {
    const myApartment = req.user;
    const matches = await Promise.all(
      myApartment.matches.map((matchId) =>
        Roommate.findById(matchId).populate("questionnaire")
      )
    );

    const formattedMatches = matches
      .map((match) => {
        const compatibilityScore = calculateCompatibilityScore(
          myApartment.questionnaire,
          match.questionnaire
        );

        return {
          match,
          matchInfo: {
            image: match.profilePicture,
            score: compatibilityScore,
            title: match.name,
            subTitle: `${match.age} years old`,
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
    const myApartment = req.user;

    const formatRoommates = async (roommateIds) => {
      const roommates = await Promise.all(
        roommateIds.map((id) => Roommate.findById(id).populate("questionnaire"))
      );

      return roommates.map((roommate) => {
        const compatibilityScore = calculateCompatibilityScore(
          myApartment.questionnaire,
          roommate.questionnaire
        );

        return {
          roommate,
          score: compatibilityScore,
        };
      });
    };

    const likes = await formatRoommates(myApartment.likes);
    const dislikes = await formatRoommates(myApartment.dislikes);

    res.json({ likes, dislikes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getSuggestions = async (req, res) => {
  try {
    const apartment = req.user;
    const roommates = await Roommate.find().populate("questionnaire");

    const compatibleRoommates = roommates
      .filter(
        (roommate) =>
          !apartment.dislikes.includes(roommate._id) &&
          !apartment.likes.includes(roommate._id) &&
          !apartment.matches.includes(roommate._id)
      )
      .filter((roommate) => {
        return matchesPreferences(apartment.preferences, roommate);
      })
  
      .map((roommate) => {
        const compatibilityScore = calculateCompatibilityScore(
          apartment.questionnaire,
          roommate.questionnaire
        );

        return {
          roommate,
          score: compatibilityScore,
          sortOption: {
            score: compatibilityScore,
            age: roommate.age,
            date: roommate.createdAt,
          },
        };
      })
      .sort((a, b) => b.score - a.score);
    res.json(compatibleRoommates);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.updateApartment = async (req, res) => {
  try {
    const { questionnaire, ...otherFields } = req.body;
    let updatedApartment = req.user;

    if (questionnaire) {
      const updatedQuestionnaire = await Question.findByIdAndUpdate(
        updatedApartment.questionnaire,
        questionnaire,
        { new: true, runValidators: true }
      );

      if (!updatedQuestionnaire) {
        return res.status(404).json({ message: "Questionnaire not found" });
      }

      updatedApartment.questionnaire = updatedQuestionnaire._id;
    }

    Object.assign(updatedApartment, otherFields);
    await updatedApartment.save();

    res.json(updatedApartment);
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

exports.setApartmentPreferences = async (req, res) => {
  try {
    const apartment = req.user;
    const apartmentId = apartment._id;

    let {
      ageRange = [],
      gender = undefined,
      occupations = undefined,
      sharedInterests = undefined,
    } = req.body;

    console.log(req.body);

    const updatedApartment = await Apartment.findByIdAndUpdate(
      apartmentId,
      { preferences: { ageRange, gender, occupations, sharedInterests } },
      { new: true, runValidators: true }
    );

    if (!updatedApartment) {
      return res.status(404).json({ message: "Apartment not found" });
    }

    res.status(200).json({
      message: "Apartment preferences updated successfully",
      apartment: apartment,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error updating partment preferences" });
  }
};
exports.apartmentActions = async (req, res) => {
  try {
    const { targetId } = req.params;
    const { action } = req.query;
    const myApartment = req.user;

    const roommate = await Roommate.findById(targetId);
    if (!roommate) {
      return res.status(404).json({ message: "Roommate not found" });
    }

    switch (action) {
      case "like":
        if (!myApartment.likes.includes(roommate._id)) {
          myApartment.likes.push(roommate._id);
          myApartment.dislikes = myApartment.dislikes.filter(
            (id) => !id.equals(roommate._id)
          );
        }
        break;
      case "dislike":
        if (!myApartment.dislikes.includes(roommate._id)) {
          myApartment.dislikes.push(roommate._id);
          myApartment.likes = myApartment.likes.filter(
            (id) => !id.equals(roommate._id)
          );
        }
        break;

      default:
        return res.status(400).json({ message: "Invalid action" });
    }

    await myApartment.save();
    return res.json({ message: "Action successful" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

function matchesPreferences(apartmentPreferences, roommate) {

  if (
    roommate.personalInfo.age < apartmentPreferences.ageRange[0] ||
    roommate.personalInfo.age > apartmentPreferences.ageRange[1]
  ) {
    console.log("age");
    return false;
  }

  if (apartmentPreferences.gender.length > 0 && !apartmentPreferences.gender.includes(roommate.personalInfo.gender)) {
    console.log(apartmentPreferences);
    console.log(apartmentPreferences.gender);
    console.log(roommate.personalInfo.gender);
    return false;
  }

  if (apartmentPreferences.occupations.length > 0 && !apartmentPreferences.occupations.includes(roommate.personalInfo.occupation)) {
    console.log(apartmentPreferences.occupations);
    console.log(roommate.personalInfo.occupation);
    return false;
  }

  
  return true;
}
