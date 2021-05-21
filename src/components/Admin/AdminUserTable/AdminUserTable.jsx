import Link from 'next/link';
import styles from '../../../styles/Admin.module.scss';
import tableStyles from '../../../styles/Table.module.scss';

const AdminUserTable = ({ users }) => (
  <table className={`${tableStyles.table} ${styles.admintable}`}>
    <thead>
      <tr>
        <th>First Name</th>
        <th>Last Name</th>
        <th>Email</th>
        <th style={{ width: '15%' }}>Sites</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody>
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
            <Link href={`/admin/promote/${user._id}`}>Make Site Manager</Link>
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);

export default AdminUserTable;
