import { useRouter } from 'next/router';
import styles from '../../../styles/Admin.module.scss';
import tableStyles from '../../../styles/Table.module.scss';

const AdminUserTable = ({ users }) => {
  const router = useRouter();
  return (
    <table className={`${tableStyles.table} ${styles.admintable}`}>
      <tr>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Email</th>
        <th style={{ width: '15%' }}>Sites</th>
        <th>Actions</th>
      </tr>
      {users.map(user => (
        <tr key={user._id}>
          <td>{user.firstName}</td>
          <td>{user.lastName}</td>
          <td>{user.email}</td>
          <td>
            {user.access.map((site, index) => (
              <>
                {site.siteId} ({site.siteRole})
                {index !== user.access.length - 1 && (
                  <>
                    , <br />
                  </>
                )}
              </>
            ))}
            {user.access.length === 0 && 'N/A'}
          </td>
          <td className={styles.actions}>
            <button
              type="button"
              onClick={e => {
                e.preventDefault();
                router.push(`/admin/promote/${user._id}`);
              }}
            >
              Make Site Manager
            </button>
          </td>
        </tr>
      ))}
    </table>
  );
};

export default AdminUserTable;
