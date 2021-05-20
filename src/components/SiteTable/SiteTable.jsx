import { useRouter } from 'next/router';
import styles from '../../styles/Admin.module.scss';
import tableStyles from '../../styles/Table.module.scss';

const SiteTable = ({ sites, mode }) => {
  const router = useRouter();
  const handleManage = e => {
    e.preventDefault();
    router.push(`/sites/${e.target.name}`);
  };
  const RowsForSite = ({ filteredSites }) =>
    filteredSites
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
          {mode === 'admin' && (
            <td>
              {site.members
                .filter(member => member.siteRole === 'manager')
                .map((member, index) => (
                  <>
                    {member.firstName} {member.lastName}
                    {index + 1 !==
                      site.members.filter(mbr => mbr.siteRole === 'manager')
                        .length && (
                      <>
                        , <br />
                      </>
                    )}
                  </>
                ))}
              {site.members.filter(member => member.siteRole === 'manager')
                .length === 0 && ''}
            </td>
          )}
          <td className={styles.actions}>
            <button type="button" name={site.siteId} onClick={handleManage}>
              Manage
            </button>
          </td>
        </tr>
      ));
  return (
    <table className={`${tableStyles.table} ${styles.admintable}`}>
      <tr>
        <th>ID</th>
        <th>Name</th>
        <th>Used IDs</th>
        <th>Members</th>
        {mode === 'admin' && <th style={{ width: '15%' }}>Manager(s)</th>}
        <th>Actions</th>
      </tr>
      <tr>
        <td colSpan={6}>
          <strong>PRESCIENT</strong>
        </td>
      </tr>
      <RowsForSite
        filteredSites={sites.filter(site => site.network === 'PRESCIENT')}
      />
      <tr>
        <td colSpan={6}>
          <strong>ProNET</strong>
        </td>
      </tr>
      <RowsForSite
        filteredSites={sites.filter(site => site.network === 'ProNET')}
      />
    </table>
  );
};

export default SiteTable;
