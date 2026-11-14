import mongoose from "mongoose";
import Assessment from "../models/Assesment.js";
import Attempt from "../models/Attempt.js";

export const createAssessment = async(req, res)=>{
    try{

        const {
            title,
            description,
            subject,
            duration,
            questions,
            startTime,
            endTime
        } = req.body;


         // Basic validation
        if (
            !title ||
            !subject ||
            !duration ||
            !questions ||
            !startTime ||
            !endTime
        ) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields"
            });
        }

         if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                message: "At least one question is required"
            });
        }
        const start = new Date(startTime);
        const end = new Date(endTime);

        if (
            Number.isNaN(start.getTime()) ||
            Number.isNaN(end.getTime()) ||
            end <= start
        ) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment schedule"
            });
        }
         const totalMarks = questions.reduce(
            (sum, question) => sum + Number(question.marks),
            0
        );

        if (totalMarks <= 0 || duration <= 0) {
            return res.status(400).json({
                success: false,
                message: "Duration and marks must be positive"
            });
        }


        const assessment = await Assessment.create({
            title,
            description,
            subject,
            duration,
            questions,
            totalMarks,
            startTime: start,
            endTime: end,
            createdBy: req.user.id
        });

        return res.status(201).json({
            success: true,
            message: "Assessment created successfully",
            assessment
        });

    }catch(error){
        console.error("Create assessment error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

//Get faculty assesments
export const getMyAssessments = async(req,res)=>{
    try{

        const assessments = await Assessment.find({
            createdBy: req.user.id
        }).sort({createdAt: -1});

        return res.status(200).json({
            success:true,
            count: assessments.length,
            assessments
        })
    }catch(error){
         console.error("Get assessments error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });

    }
}


//Get assessments by id
export const getAssessmentById = async(req,res)=>{
    try{
         const {id} = req.params;

         if(!mongoose.Types.ObjectId.isValid(id)){
            return  res.status(400).json({
                success: false ,
                messaage: "Invalid assessment ID"
            });
         }


         const assessment =  await Assessment.findOne({
            _id: id,
            createdBy:req.user.id
         })

     
         if(!assessment){
            return res.status(400).json({
                success:false,
                message: "Assessment not found"
            });
         }


         return res.status(200).json({
            success: true,
            assessment
         })
    }catch(error){
         console.error("Get assessment error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }

}


export  const publishAssessment = async(req,  res)=>{
    try{

        const {id} = req.params;
         if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment ID"
            });
        }

        const assessment = await Assessment.findOne({
            _id:id,
            createdBy: req.user.id
        });
        console.log("Assessment query result:", assessment);

        if(!assessment){
            return res.status(404).json({
                success:false,
                message: "Assignment not found"
            });
        }
        console.log("Assessment ID:", assessment._id);
console.log("Current Status:", assessment.status);
console.log("Status Type:", typeof assessment.status);

        if(assessment.status!=="draft"){
            return res.status(404).json({
                success:false,
                message: "Only draft assessments can be published"
            });
        }

        //valiate assessment schedule

        if(new Date(assessment.endTime)<= new Date(assessment.startTime)){
            return res.status(400).json({
                success:false,
                message: "Invalid assessment schedule"
            });
        }
        
        assessment.status = "published";
        await assessment.save();

        return res.status(200).json({
            success:true,
            messaage: "Assessment published",
            assessment:{
                id: assessment._id,
                title: assessment.title,
                status: assessment.status
            }

        });

    }catch(error){
        console.error("Publishing error ",error.message);
    }
}


//published Assessments 

export const getAvailableAssessments = async(req,res)=>{
    try{

        const assessments  = await Assessment.find({
            status: "published"
        })
        .select(
            "title description subject totalMarks duration questions.questionText questions.options questions.marks startTime endTime"
        ).sort({startTime: 1})
        .lean()

        return res.status(200).json({
            success: true,
            count: assessments.length,
            assessments
        })

    }catch(error){
         console.error("Get available assessments error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

//Get student Assessment by id

export const getStudentAssessmentById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment ID"
            });
        }

        const assessment = await Assessment.findOne({
            _id: id,
            status: "published"
        }).select(
            "title description subject totalMarks duration questions.questionText questions.options questions.marks startTime endTime"
        );

        if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found or not published"
            });
        }

        return res.status(200).json({
            success: true,
            assessment
        });

    } catch (error) {
        console.error("Get student assessment error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
};

//Submit Assesment
export const submitAssesment = async(req,res)=>{
    try{

        const {id} = req.params;
        const {answers} = req.body;

        //validate Assesment ID


        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({
                success:false,
                message: "Invalid assessment ID"
            });
        }

        //validate answers

        if(!Array.isArray(answers)|| answers.length===0){
            return res.status(400).json({
                success: false,
                message: "Please providde answers"
            });
        }

        //Find published assessment

        const assessment = await  Assessment.findOne({
            _id: id,
            status: "published"
        });


          if (!assessment) {
            return res.status(404).json({
                success: false,
                message: "Assessment not found"
            });
        }

        //Check duplicate submission

        const existingAttempt = await Attempt.findOne({
            assessment: id,
            student: req.user.id
        });

        if(existingAttempt){
            return res.status(400).json({
                success: false,
                messaage: "You have already submitted the assessment"
            });
        }

        let score  = 0;
        const submittedAnswers = [];
        const answeredQuestionIds = new Set();
        for(const answer of answers){

              if (!mongoose.Types.ObjectId.isValid(answer.questionId)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid question ID"
                });
            }

              if (!["A", "B", "C", "D"].includes(answer.selectedAnswer)) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid selected answer"
                });
            }

             if (answeredQuestionIds.has(answer.questionId)) {
                return res.status(400).json({
                    success: false,
                    message: "Duplicate question answer"
                });
            }

               answeredQuestionIds.add(answer.questionId);

            const question = assessment.questions.id(answer.questionId);

            if (!question) {
                return res.status(400).json({
                    success: false,
                    message: "Question does not belong to this assessment"
                });
            }
             if (question.correctAnswer === answer.selectedAnswer) {
                score += question.marks;
            }

            submittedAnswers.push({
                questionId: question._id,
                selectedAnswer: answer.selectedAnswer
            });
               const attempt = await Attempt.create({
            assessment: id,
            student: req.user.id,
            answers: submittedAnswers,
            score,
            totalMarks: assessment.totalMarks,
            status: "submitted"
        });

    return res.status(201).json({
            success: true,
            message: "Assessment submitted successfully",
            result: {
                attemptId: attempt._id,
                score: attempt.score,
                totalMarks: attempt.totalMarks,
                submittedAt: attempt.submittedAt
            }
        });


        }
    }catch(error){
         console.error("Submit assessment error:", error.message);

        // Handle concurrent duplicate submissions
        if (error.code === 11000) {
            return res.status(409).json({
                success: false,
                message: "You have already submitted this assessment"
            });
        }
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}


export const getStudentResult  = async(req,res) =>{
    try{
        const {id}= req.params;

          if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid assessment ID"
            });
        }

          const attempt = await Attempt.findOne({
            assessment: id,
            student: req.user.id
        }).populate("assessment", "title subject totalMarks");

          if (!attempt) {
            return res.status(404).json({
                success: false,
                message: "Result not found"
            });
        }

        return res.status(200).json({
            success: true,
            result: {
                attemptId: attempt._id,
                assessment: attempt.assessment,
                score: attempt.score,
                totalMarks: attempt.totalMarks,
                answers: attempt.answers,
                status: attempt.status,
                submittedAt: attempt.submittedAt
            }
        });


    }catch(error){
        console.error("Get student result error:", error.message);

        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}

//Get attempts 
export const getAssessmentAttempts = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate assessment ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment ID"
      });
    }

    // Check whether this assessment belongs to the logged-in faculty
    const assessment = await Assessment.findOne({
      _id: id,
      createdBy: req.user.id
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found"
      });
    }

    // Fetch all student attempts
    const attempts = await Attempt.find({
      assessment: id
    })
      .populate("student", "name email")
      .select("student score totalMarks status submittedAt")
      .sort({ submittedAt: -1 });

    return res.status(200).json({
      success: true,
      count: attempts.length,
      assessment: {
        id: assessment._id,
        title: assessment.title
      },
      attempts
    });

  } catch (error) {
    console.error("Get assessment attempts error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};


export const getStudentAttemptDetails = async (req, res) => {
  try {
    const { id, attemptId } = req.params;

    // Validate both IDs
    if (
      !mongoose.Types.ObjectId.isValid(id) ||
      !mongoose.Types.ObjectId.isValid(attemptId)
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment or attempt ID"
      });
    }

    // Verify assessment ownership
    const assessment = await Assessment.findOne({
      _id: id,
      createdBy: req.user.id
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found"
      });
    }

    // Find the attempt belonging to this assessment
    const attempt = await Attempt.findOne({
      _id: attemptId,
      assessment: id
    }).populate("student", "name email");

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Student attempt not found"
      });
    }

    // Prepare question-wise evaluation
    const evaluatedAnswers = attempt.answers.map(answer => {
      const question = assessment.questions.id(answer.questionId);

      if (!question) return null;

      const isCorrect =
        question.correctAnswer === answer.selectedAnswer;

      return {
        questionId: question._id,
        questionText: question.questionText,
        options: question.options,
        selectedAnswer: answer.selectedAnswer,
        correctAnswer: question.correctAnswer,
        isCorrect,
        marksAwarded: isCorrect ? question.marks : 0,
        totalQuestionMarks: question.marks
      };
    }).filter(Boolean);

    return res.status(200).json({
      success: true,
      attempt: {
        attemptId: attempt._id,
        student: attempt.student,
        assessment: {
          id: assessment._id,
          title: assessment.title,
          subject: assessment.subject
        },
        answers: evaluatedAnswers,
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        status: attempt.status,
        submittedAt: attempt.submittedAt
      }
    });

  } catch (error) {
    console.error("Get student attempt details error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



export const updateDraftAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      description,
      subject,
      duration,
      questions,
      startTime,
      endTime
    } = req.body;

    // Validate assessment ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment ID"
      });
    }

    // Find assessment created by logged-in faculty
    const assessment = await Assessment.findOne({
      _id: id,
      createdBy: req.user.id
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found"
      });
    }

    // Only draft assessments can be edited
    if (assessment.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft assessments can be updated"
      });
    }

    // Update only provided fields
    if (title !== undefined) assessment.title = title;
    if (description !== undefined) assessment.description = description;
    if (subject !== undefined) assessment.subject = subject;
    if (duration !== undefined) assessment.duration = duration;
    if (questions !== undefined) assessment.questions = questions;
    if (startTime !== undefined) assessment.startTime = startTime;
    if (endTime !== undefined) assessment.endTime = endTime;

    // Recalculate total marks
    if (questions !== undefined) {
      assessment.totalMarks = questions.reduce(
        (total, question) => total + Number(question.marks),
        0
      );
    }

    await assessment.save();

    return res.status(200).json({
      success: true,
      message: "Draft assessment updated successfully",
      assessment
    });

  } catch (error) {
    console.error("Update assessment error:", error.message);

    if (error.name === "ValidationError") {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};



export const deleteDraftAssessment = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate assessment ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assessment ID"
      });
    }

    // Find assessment belonging to logged-in faculty
    const assessment = await Assessment.findOne({
      _id: id,
      createdBy: req.user.id
    });

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: "Assessment not found"
      });
    }

    // Only draft assessments can be deleted
    if (assessment.status !== "draft") {
      return res.status(400).json({
        success: false,
        message: "Only draft assessments can be deleted"
      });
    }

    await Assessment.deleteOne({ _id: id });

    return res.status(200).json({
      success: true,
      message: "Draft assessment deleted successfully"
    });

  } catch (error) {
    console.error("Delete assessment error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

//Get faculty Dashboard



export const getFacultyDashboard = async (req, res) => {
  try {
    // Get assessments created by logged-in faculty
    const assessments = await Assessment.find({
      createdBy: req.user.id
    })
      .select("_id status")
      .lean();

    const assessmentIds = assessments.map(
      assessment => assessment._id
    );

    // Count assessments by status
    const totalAssessments = assessments.length;

    const publishedAssessments = assessments.filter(
      assessment => assessment.status === "published"
    ).length;

    const draftAssessments = assessments.filter(
      assessment => assessment.status === "draft"
    ).length;

    // Calculate student performance
    const performance = await Attempt.aggregate([
      {
        $match: {
          assessment: { $in: assessmentIds },
          status: "submitted"
        }
      },
      {
        $group: {
          _id: null,

          totalSubmissions: { $sum: 1 },

          averageScore: { $avg: "$score" },

          highestScore: { $max: "$score" },

          lowestScore: { $min: "$score" },

          averagePercentage: {
            $avg: {
              $multiply: [
                { $divide: ["$score", "$totalMarks"] },
                100
              ]
            }
          }
        }
      }
    ]);

    const stats = performance[0] || {};

    return res.status(200).json({
      success: true,
      dashboard: {
        totalAssessments,
        publishedAssessments,
        draftAssessments,

        totalSubmissions: stats.totalSubmissions || 0,

        averageScore: Number(
          (stats.averageScore || 0).toFixed(2)
        ),

        highestScore: stats.highestScore || 0,

        lowestScore: stats.lowestScore || 0,

        averagePercentage: Number(
          (stats.averagePercentage || 0).toFixed(2)
        )
      }
    });

  } catch (error) {
    console.error("Faculty dashboard error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};





