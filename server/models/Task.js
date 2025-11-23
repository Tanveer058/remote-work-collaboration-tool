import mongoose from 'mongoose';

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  public_id: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  format: String,
  resource_type: String
});

const submissionSchema = new mongoose.Schema({
  submittedAt: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  files: [fileSchema] 
});

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Task description is required']
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  deadline: {
    type: Date,
    required: [true, 'Deadline is required']
  },
  submission: submissionSchema,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

taskSchema.virtual('submissionStatus').get(function() {
  if (this.status !== 'completed') {
    return new Date() > this.deadline ? 'overdue' : 'pending';
  }
  
  if (this.submission && this.submission.submittedAt) {
    if (this.submission.submittedAt <= this.deadline) {
      return 'on_time';
    } else {
      return 'late';
    }
  }
  return 'pending';
});

taskSchema.set('toJSON', { virtuals: true });
taskSchema.set('toObject', { virtuals: true });

const Task = mongoose.model('Task', taskSchema);
export default Task;