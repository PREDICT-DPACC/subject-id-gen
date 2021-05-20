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

export { OptionsForSiteList };
