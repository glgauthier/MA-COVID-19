# [Massachusetts COVID-19 Visualization](https://glgauthier.github.io/MA-COVID-19/)
Automatically pulls and parses the latest COVID-19 information from the state of massachusetts website. This data is then converted to a web-friendly format, uploaded to github-pages, and plotted using D3

### Data Sources:
[MassGIS County Boundaries Dataset](https://docs.digital.mass.gov/dataset/massgis-data-county-boundaries) <br/>
[MA COVID-19 Cases, Quarantine and Monitoring](https://www.mass.gov/info-details/covid-19-cases-quarantine-and-monitoring)

### Libraries Used:
[Selenium WebDriver](https://www.selenium.dev/) for pulling the latest .pdf updates <br/>
[tabula-py](https://github.com/chezou/tabula-py) for PDF parsing <br/>
[d3](https://d3js.org/) for data vis
