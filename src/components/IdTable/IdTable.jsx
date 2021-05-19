import tableStyles from '../../styles/Table.module.scss';
import styles from './IdTable.module.scss';

const IdTable = ({ ids, mode }) => (
  <table className={tableStyles.table}>
    <thead>
      <tr>
        <th>ID</th>
        <th>Date generated</th>
        {mode === 'manage' && <th>User</th>}
      </tr>
    </thead>
    <tbody>
      {ids.map(id => (
        <tr key={id.id}>
          <td className={styles.mono}>{id.id}</td>
          <td>{new Date(id.usedDate).toLocaleString('en-US')}</td>
          {mode === 'manage' && <td>{id.usedBy}</td>}
        </tr>
      ))}
    </tbody>
  </table>
);

export default IdTable;
