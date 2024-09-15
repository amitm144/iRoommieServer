const math = require('mathjs');

function calculateCompatibilityScore(userQuestions, candidateQuestions) {
  const characteristics = [
    'smokingFrequency',
    'cleanlinessLevel',
    'cleanlinessInCommonAreas',
    'personalHygiene',
    'numberOfPets',
    'petBehavior',
    'alcoholConsumption',
    'socialBehavior',
    'frequencyOfGuests',
    'frequencyOfSocialGatherings',
    'importanceOfPrivacy',
    'importanceOfPersonalSpaceInSharedAreas',
    'importanceOfPersonalSpaceInBedroom',
    'respectForSharedAreas',
    'dietaryPreferences',
    'dietaryRestrictions',
    'fitnessAndExerciseLevel',
    'workOrStudyHabits',
    'importanceOfQuietTimeForWorkOrStudy',
    'politicalViews',
    'respectForDiversity',
    'environmentalAwareness',
    'importanceOfEnergyConservation',
    'activityLevelOfHobbies',
    'importanceOfQuietEnvironment',
    'musicPreferencesAndVolumeLevels',
    'sleepingPatterns',
    'importanceOfReligiousPractices',
    'willingnessToShareHouseholdChores',
    'importanceOfPersonalTimeForHobbies'
  ];

  let compatibilityScore = 0;
  let totalCharacteristics = characteristics.length;

  for (const characteristic of characteristics) {
    const userAnswer = userQuestions[characteristic];
    const candidateAnswer = candidateQuestions[characteristic];

    if (!userAnswer || !candidateAnswer) continue;

    const userValue = userAnswer.value;
    const candidateValue = candidateAnswer.value;
    const weight = Math.pow(userAnswer.importance, 2);

    const difference = Math.abs(userValue - candidateValue);
    const weightedDifference = difference * weight;
    const maxDifference = 4 * weight;

    const characteristicScore = 1 - (weightedDifference / maxDifference);
    compatibilityScore += characteristicScore;
  }

  const overallCompatibilityScore = Math.round((compatibilityScore / totalCharacteristics) * 100);
  return overallCompatibilityScore;
}

module.exports = calculateCompatibilityScore;