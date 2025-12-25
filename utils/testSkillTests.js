// Quick test script to check if skill tests are working
import sequelize from "../config/db.js";
import { SkillTest } from "../models/SkillTest.js";
import Question from "../models/Question.js";

const testSkillTests = async () => {
  try {
    console.log("Testing Skill Tests API...");
    
    // Check if tests exist
    const tests = await SkillTest.findAll();
    console.log(`Found ${tests.length} skill tests in database`);
    
    if (tests.length > 0) {
      for (const test of tests) {
        const questionCount = await Question.count({ where: { test_id: test.id } });
        console.log(`- ${test.skill_name}: ${questionCount} questions`);
      }
    } else {
      console.log("⚠️ No skill tests found. Run seedData.js first.");
    }
    
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

testSkillTests();

