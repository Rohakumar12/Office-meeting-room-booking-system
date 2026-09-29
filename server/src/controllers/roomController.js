const roomService = require('../services/roomService');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');
const { uploadImageFromLocalFile } = require('../utils/cloudinary');
//controllers deal with req, res, next, http status code, http response and calling the service
const getRooms = async (req, res, next) => {
  try {
    const { page, limit, ...filters } = req.query;
    const result = await roomService.getRooms(filters, page, limit);
    return res.status(200).json(new ApiResponse(200, result, 'Rooms retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const getRoomById = async (req, res, next) => {
  try {
    const room = await roomService.getRoomById(req.params.id);
    return res.status(200).json(new ApiResponse(200, { room }, 'Room retrieved successfully'));
  } catch (error) {
    next(error);
  }
};

const createRoom = async (req, res, next) => {
  try {
    const room = await roomService.createRoom(req.body);
    return res.status(201).json(new ApiResponse(201, { room }, 'Room created successfully'));
  } catch (error) {
    next(error);
  }
};

const updateRoom = async (req, res, next) => {
  try {
    const room = await roomService.updateRoom(req.params.id, req.body);
    return res.status(200).json(new ApiResponse(200, { room }, 'Room updated successfully'));
  } catch (error) {
    next(error);
  }
};

const deleteRoom = async (req, res, next) => {
  try {
    const result = await roomService.deleteRoom(req.params.id);
    return res.status(200).json(new ApiResponse(200, result, result.message));
  } catch (error) {
    next(error);
  }
};

const getAvailableRooms = async (req, res, next) => {
  try {
    const rooms = await roomService.getAvailableRooms(req.query);
    return res
      .status(200)
      .json(new ApiResponse(200, { rooms, count: rooms.length }, 'Available rooms retrieved'));
  } catch (error) {
    next(error);
  }
};

const getRoomSchedule = async (req, res, next) => {
  try {
    const { date } = req.query;
    const result = await roomService.getRoomSchedule(req.params.id, date);
    return res.status(200).json(new ApiResponse(200, result, 'Room schedule retrieved'));
  } catch (error) {
    next(error);
  }
};

const uploadRoomImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError(400, 'Room image file is required');
    }

    const upload = await uploadImageFromLocalFile(req.file.path, {
      folder: `${process.env.CLOUDINARY_FOLDER || 'roomreserve'}/room-images`,
      transformation: [
        { width: 1600, height: 900, crop: 'limit' },
        { quality: 'auto' },
      ],
    });

    return res.status(200).json(
      new ApiResponse(
        200,
        { url: upload.url, publicId: upload.publicId },
        'Room image uploaded successfully',
      ),
    );
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRooms,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  getAvailableRooms,
  getRoomSchedule,
  uploadRoomImage,
};
