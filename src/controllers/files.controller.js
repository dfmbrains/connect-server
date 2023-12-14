const path = require('path');
const fs = require("fs");
const {v4: uuid} = require('uuid');

const db = require('../../db')

const selectOneElement = require("../middleware/selectOneElement");

class FilesController {
  async createImage(req, res) {
    const imagePath = req.file.path;

    try {
      const fileId = uuid()
      await db.query('INSERT INTO images (id, path, created) VALUES ($1, $2, $3)', [fileId, imagePath, new Date()]);
      res.json({message: 'Image uploaded successfully', value: fileId, status: true})
    } catch (err) {
      res.status(500).send('Error uploading image');
    }
  }

  async getImageById(req, res) {
    const {id} = req.query;

    try {
      const file = selectOneElement(await db.query('SELECT * FROM images where id = $1', [id]));

      if (file) {
        const filePath = path.resolve(__dirname, '../../', file.path);

        res.sendFile(filePath);
      } else {
        res.json({message: 'Image not found', value: null, status: false})
      }
    } catch (err) {
      res.status(500).send(`Error getting image: ${err.message}`);
    }
  }

  async deleteImageById(req, res) {
    const {id} = req.query;

    try {
      const file = selectOneElement(await db.query('SELECT * FROM images where id = $1', [id]));
      await db.query('DELETE FROM images where id = $1 RETURNING *', [id])

      if (file) {
        const filePath = path.resolve(__dirname, '../../', file.path);

        fs.unlink(filePath, (err) => {
          if (err) {
            res.status(500).send(`Error getting image: ${err.message}`);
          } else {
            res.json({message: 'File successfully deleted', value: null, status: true});
          }
        });
      } else {
        res.json({message: 'Image not found', value: null, status: false})
      }
    } catch (err) {
      res.status(500).send(`Error getting image: ${err.message}`);
    }
  }
}

module.exports = new FilesController()