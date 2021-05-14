import styles from './AdminNav.module.scss';

const AdminNav = ({ activeKey, setActiveKey }) => (
  <div className={styles.nav}>
    {activeKey === 'users' && <span>Users</span>}
    {activeKey !== 'users' && (
      <a href="#" onClick={() => setActiveKey('users')}>
        Users
      </a>
    )}
    {activeKey === 'sites' && <span>Sites</span>}
    {activeKey !== 'sites' && (
      <a href="#" onClick={() => setActiveKey('sites')}>
        Sites
      </a>
    )}
  </div>
);

export default AdminNav;
