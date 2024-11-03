import ChatModel from '../Models/chatModel.js'

export const createChat = async (req, res) => {
  const newChat = await new ChatModel({
    members: [req.body.userId, req.body.otherUserIds]

  });
  console.log(newChat.members)
  try {

    const result = await newChat.save();
    res.status(200).json(result)

  } catch (error) {
    res.status(500).json(error)

  }
};




export const userChats = async (req, res) => {
  try {
    const chat = await ChatModel.find({
      members: { $in: [req.params.userId] }  //.then("Data hai").catch("Nhi h")ss
    })
    //console.log(chat.followers);
    console.log(chat)
    res.status(200).json(chat)
  } catch (error) {
    res.status(500).json(error)
  }
}


export const findChat = async (req, res) => {
  try {
    const chat = await ChatModel.findOne({
      members: { $all: [req.params.firstId, req.params.secondId] },

    })
    // res.render(chat)
    res.status(200).json(chat)
  } catch (error) {
    res.status(500).json(error)
  }
}