const path = require('path');
const fs = require("fs");

const db = require('../../db')

const selectOneElement = require("../middleware/selectOneElement");

class FilesController {
  async createImage(req, res) {
    const imagePath = req.file.path;

    try {
      await db.query('INSERT INTO images (path) VALUES ($1)', [imagePath]);
      res.json({message: 'Image uploaded successfully', status: true})
    } catch (err) {
      res.json({message: 'Error uploading image', status: false})
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

      if (file) {
        await db.query('DELETE FROM images where id = $1', [id])

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