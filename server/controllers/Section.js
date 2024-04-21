const Section = require("../models/Section");
const SubSection = require("../models/subSection");
const Course = require("../models/Course");
exports.createSection = async (req, res) => {
  try {
    		// Extract the required properties from the request body

    const { sectionName, courseId } = req.body;
    		// Validate the input

    if (!sectionName || !courseId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties",
      });
    }
    const newSection = await Section.create({ sectionName });
    const updateCourse = await Course.findByIdAndUpdate(
      courseId,
      {
        $push: {
          courseContent: newSection._id,
        },
      },
      {
        new: true,
      }
    )
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();

    return res.status(200).json({
      success: true,
      message: "Section Craete Successfully",
     updateCourse,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Error in creation course",
    });
  }
};
exports.updateSection = async (req, res) => {
  try {
    const { sectionName, sectionId, courseId } = req.body;
    if (!sectionName || !sectionId) {
      return res.status(400).json({
        success: false,
        message: "Missing Properties",
      });
    }
    const section = await Section.findByIdAndUpdate(
      sectionId,
      { sectionName },
      { new: true }
    );
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    return res.status(200).json({
      success: true,
      message: section,
      data: course,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Error in updating course",
    });
  }
};
exports.deleteSection = async (req, res) => {
  try {
    //params url id
    const { sectionId, courseId } = req.body;
    await Course.findByIdAndUpdate(courseId, {
      $pull: {
        courseContent: sectionId,
      },
    });
    const section = await Section.findById(sectionId);
    console.log(sectionId, courseId);
    if (!section) {
      return res.status(404).json({
        success: false,
        message: "Section not Found",
      });
    }
    //delete sub section
    await SubSection.deleteMany({ _id: { $in: section.subSection } });

    await Section.findByIdAndDelete(sectionId);

    //find the updated course and return
    const course = await Course.findById(courseId)
      .populate({
        path: "courseContent",
        populate: {
          path: "subSection",
        },
      })
      .exec();
    res.status(200).json({
      success: true,
      message: "Section deleted",
      data: course,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Error in updating course",
    });
  }
};
