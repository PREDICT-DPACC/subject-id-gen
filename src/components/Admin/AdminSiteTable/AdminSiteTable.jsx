import styles from '../Admin.module.scss';

const AdminSiteTable = ({ sites }) => (
  <table className={styles.table}>
    <tr>
      <th>ID</th>
      <th>Name</th>
      <th>Used IDs</th>
      <th>Members</th>
      <th style={{ width: '15%' }}>Manager(s)</th>
      <th>Actions</th>
    </tr>
    {sites
      .sort((a, b) => {
        if (a.siteId < b.siteId) return -1;
        if (a.siteId > b.siteId) return 1;
        return 0;
      })
      .map(site => (
        <tr key={site._id}>
          <td>{site.siteId}</td>
          <td>{site.name}</td>
          <td>{site.idseq - 1}</td>
          <td>{site.members.length}</td>
          <td>
            {site.members
              .filter(member => member.siteRole === 'manager')
              .map((member, index) => (
                <>
                  {member.firstName} {member.lastName}
                  {index !== site.members.length - 1 && (
                    <>
                      , <br />
                    </>
                  )}
                </>
              ))}
            {site.members.filter(member => member.role === 'manager').length ===
              0 && ''}
          </td>
          <td className={styles.actions}>-</td>
        </tr>
      ))}
  </table>
);

export default AdminSiteTable;
