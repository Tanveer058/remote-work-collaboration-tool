import Task from '../models/Task.js';
import { upload } from '../middleware/upload.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import { cleanupTempFiles } from '../middleware/upload.js';

// Export multer upload for use in routes
export { upload };

export const createTask = async (req, res) => {
  try {
    const { title, description, assignedTo, priority, deadline } = req.body;

    const task = await Task.create({
      title,
      description,
      assignedTo,
      assignedBy: req.user._id,
      team: req.user.team,
      priority,
      deadline
    });

    const populatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    res.status(201).json(populatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeamTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ team: req.user.team })
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email')
      .sort({ createdAt: -1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('assignedBy', 'name email')
      .sort({ deadline: 1 });
    
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTaskStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.status = status;
    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const submitTask = async (req, res) => {
  try {
    const { description } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    const uploadedFiles = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        try {
          const cloudinaryResult = await uploadToCloudinary(file.path);
          
          uploadedFiles.push({
            name: file.originalname,
            url: cloudinaryResult.secure_url,
            public_id: cloudinaryResult.public_id,
            size: cloudinaryResult.bytes,
            format: cloudinaryResult.format,
            resource_type: cloudinaryResult.resource_type
          });
        } catch (uploadError) {
          console.error('Failed to upload file to Cloudinary:', uploadError);
        }
      }

      // Clean up temporary files
      cleanupTempFiles(req.files);
    }

    task.status = 'completed';
    task.submission = {
      submittedAt: new Date(),
      description,
      files: uploadedFiles
    };

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    res.json(updatedTask);
  } catch (error) {
    if (req.files) {
      cleanupTempFiles(req.files);
    }
    res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, priority, deadline, assignedTo } = req.body;
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    task.title = title || task.title;
    task.description = description || task.description;
    task.priority = priority || task.priority;
    task.deadline = deadline || task.deadline;
    task.assignedTo = assignedTo || task.assignedTo;

    await task.save();

    const updatedTask = await Task.findById(task._id)
      .populate('assignedTo', 'name email')
      .populate('assignedBy', 'name email');

    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    // Delete files from Cloudinary if task has submission
    if (task.submission && task.submission.files) {
      for (const file of task.submission.files) {
        try {
          await deleteFromCloudinary(file.public_id);
        } catch (deleteError) {
          console.error('Failed to delete file from Cloudinary:', deleteError);
          // Continue deletion even if file deletion fails
        }
      }
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};