const selectOneElement = (response) => {
  if (response) {
    return response.rows[0]
  } else {
    return null
  }
}

module.exports = selectOneElement