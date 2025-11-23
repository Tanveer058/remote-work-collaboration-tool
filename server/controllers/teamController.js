import Team from '../models/Team.js';
import User from '../models/User.js';

export const createTeam = async (req, res) => {
  try {
    const { name, description, teamLead, members } = req.body;

    const teamLeadUser = await User.findById(teamLead);
    if (!teamLeadUser || teamLeadUser.role !== 'teamlead') {
      return res.status(400).json({ message: 'Invalid team lead' });
    }

    const team = await Team.create({
      name,
      description,
      teamLead,
      members: members || [],
      createdBy: req.user._id
    });

    await User.findByIdAndUpdate(teamLead, { team: team._id });
    
    if (members && members.length > 0) {
      await User.updateMany(
        { _id: { $in: members } },
        { team: team._id }
      );
    }

    const populatedTeam = await Team.findById(team._id)
      .populate('teamLead', 'name email')
      .populate('members', 'name email role');

    res.status(201).json(populatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('teamLead', 'name email')
      .populate('members', 'name email role')
      .populate('createdBy', 'name email');
    res.json(teams);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('teamLead', 'name email')
      .populate('members', 'name email role');
    
    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMyTeam = async (req, res) => {
  try {
    const team = await Team.findOne({ teamLead: req.user._id })
      .populate('teamLead', 'name email')
      .populate('members', 'name email role');
    
    if (!team) {
      return res.status(404).json({ message: 'No team assigned' });
    }
    
    res.json(team);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const { name, description, teamLead, members } = req.body;
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    const oldTeamLead = team.teamLead;
    const oldMembers = team.members;

    team.name = name || team.name;
    team.description = description || team.description;

    if (teamLead && teamLead !== team.teamLead.toString()) {
      await User.findByIdAndUpdate(oldTeamLead, { team: null });
      await User.findByIdAndUpdate(teamLead, { team: team._id });
      team.teamLead = teamLead;
    }

    if (members) {
      const removedMembers = oldMembers.filter(m => !members.includes(m.toString()));
      const newMembers = members.filter(m => !oldMembers.map(om => om.toString()).includes(m));

      await User.updateMany(
        { _id: { $in: removedMembers } },
        { team: null }
      );
      
      await User.updateMany(
        { _id: { $in: newMembers } },
        { team: team._id }
      );

      team.members = members;
    }

    await team.save();

    const updatedTeam = await Team.findById(team._id)
      .populate('teamLead', 'name email')
      .populate('members', 'name email role');

    res.json(updatedTeam);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ message: 'Team not found' });
    }

    await User.findByIdAndUpdate(team.teamLead, { team: null });
    await User.updateMany(
      { _id: { $in: team.members } },
      { team: null }
    );

    await team.deleteOne();
    res.json({ message: 'Team deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};