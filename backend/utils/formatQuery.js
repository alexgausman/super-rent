const formatQuery = (text, values) => {
  values = values || [];
  // mark multi line breaks first
  text = text.replace(/(\n)+(\s)*(\n)+/g, '<multi-break>');
  while (true) {
    var match = /\$\d+/.exec(text);
    if (match) {
      const number = parseInt(match[0].substring(1));
      let value = values[number - 1];
      if (typeof value === 'string') value = `'${value}'`;
      if (typeof value === 'undefined') value = 'NULL';
      if (value === null) value = 'NULL';
      text = text.split(match[0]).join(value);
    } else {
      text = text.replace(/\s+/g, ' ');
      text = text.split('<multi-break>').join('\n\n');
      return text.trim();
    }
  }
}

module.exports = formatQuery;
