import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema({
    doctorno: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    entryTime: {
        type: Date,
        required: true
    },
    exitTime: {
        type: Date,
        required: true
    }
});

const Doctor = mongoose.model("Doctor", doctorSchema);

export default Doctor;
