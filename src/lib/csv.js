const getDateString = ({ date }) => {
  const dateOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
  const timeOptions = {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };
  return `${new Date(date).toLocaleDateString('en-US', dateOptions)} ${new Date(
    date
  ).toLocaleTimeString('en-US', timeOptions)}`;
};

const IdTableCsvLink = ({ ids, mode }) => {
  const siteId = ids[0].site;
  const rows =
    mode === 'mine'
      ? ids.map(id => [id.id, getDateString({ date: id.usedDate })])
      : ids.map(id => [id.id, getDateString({ date: id.usedDate }), id.usedBy]);
  if (mode === 'mine') rows.unshift(['ID', 'Date generated']);
  else rows.unshift(['ID', 'Date generated', 'User']);

  const csvContent = `data:text/csv;charset=utf-8,${rows
    .map(e => e.join(','))
    .join('\n')}`;
  const encodedUri = encodeURI(csvContent);
  return (
    <a
      href={encodedUri}
      download={
        mode === 'mine' ? `${siteId}_my_ids.csv` : `${siteId}_all_ids.csv`
      }
    >
      download as CSV
    </a>
  );
};

export default IdTableCsvLink;
