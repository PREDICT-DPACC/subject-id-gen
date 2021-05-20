const OptionsForSiteList = ({ filteredSites }) =>
  filteredSites
    .sort((a, b) => {
      const nameA = a.name.toUpperCase();
      const nameB = b.name.toUpperCase();
      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    })
    .map(site => (
      <option value={site.siteId} key={site.siteId}>
        {site.name}
      </option>
    ));

const getManagerDataForSiteReq = async ({ foundSites, email }) => {
  const emailData = [
    {
      user: 'admin',
      requestingUser: email,
      sites: [],
    },
  ];
  await Promise.all(
    foundSites.map(async site => {
      if (site.members.some(member => member.siteRole === 'manager')) {
        await Promise.all(
          site.members
            .filter(member => member.siteRole === 'manager')
            .map(async member => {
              const managerIdx = emailData.findIndex(
                datum => datum.user.toString() === member.id.toString()
              );
              if (managerIdx !== -1) {
                emailData[managerIdx].sites.push({
                  name: site.name,
                  siteId: site.siteId,
                });
              } else {
                emailData.push({
                  user: member.id.toString(),
                  requestingUser: email,
                  sites: [
                    {
                      name: site.name,
                      siteId: site.siteId,
                    },
                  ],
                });
              }
            })
        );
      } else {
        const adminIdx = emailData.findIndex(datum => datum.user === 'admin');
        emailData[adminIdx].sites.push({
          name: site.name,
          siteId: site.siteId,
        });
      }
    })
  );
  return emailData;
};
export { OptionsForSiteList, getManagerDataForSiteReq };
