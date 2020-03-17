from selenium import webdriver
from selenium.webdriver.common.by import By
from tabula import read_pdf
import time, os, glob, csv, json, re

# set up chrome options to auto-download PDF rather than view it in browser
options = webdriver.ChromeOptions()
options.add_experimental_option('prefs', {
    "download.default_directory":  os.getcwd()+"\\pdf\\", #Change default directory for downloads
    "download.prompt_for_download": False, #To auto download the file
    "download.directory_upgrade": True,
    "plugins.always_open_pdf_externally": True #It will not show PDF directly in chrome
})
    
# open chrome, download the newest copy of the data
browser = webdriver.Chrome(options=options)
browser.get('https://www.mass.gov/info-details/covid-19-cases-quarantine-and-monitoring')
try:
    time.sleep(3) # wait for the page to fully load
    browser.find_element(By.XPATH, '//button[text()="No thanks"]').click();
except:
    print("no prompt to close, continuing to download")
browser.find_elements_by_partial_link_text("COVID-19 cases in Massachusetts as of")[0].click()
print("waiting for dowload...")
time.sleep(5)
driver.quit()

# parse out the data
list_of_files = glob.glob('pdf/*')
latest_file = max(list_of_files, key=os.path.getmtime)
print("all files:",list_of_files)
print("latest file is",latest_file)

df = read_pdf(latest_file)[0]

countyNames = ['Barnstable', 'Berkshire', 'Bristol', 'Essex', 'Hampden', 'Middlesex', 'Norfolk', 'Plymouth', 'Suffolk', 'Worcester', 'Unknown']
statNames =  ['Female', 'Male', 'Patient was hospitalized', 'Patient was not hospitalized', 'Under Investigation']

keys = df['Unnamed: 0'].tolist()
values = df['NUMBER OF'].tolist()

counties = {}
stats = {}
for i in range(len(keys)): 
    if keys[i] in countyNames:
        counties[keys[i]] = values[i]
    elif keys[i] in statNames:
        stats[keys[i]] = values[i]

print(counties)
print(stats)

# save the data to file
if not os.path.exists('csv/cases/'+os.path.split(latest_file)[1].replace('pdf','csv')):
    with open('csv/cases/'+os.path.split(latest_file)[1].replace('pdf','csv'), 'w', newline='\n') as csvfile:
        fieldnames = ['county', 'cases']
        writer = csv.writer(csvfile,delimiter=',')
        writer.writerow(fieldnames)

        for i in counties:
            writer.writerow([i, counties[i]])

if not os.path.exists('csv/stats/'+os.path.split(latest_file)[1].replace('pdf','csv')):
    with open('csv/stats/'+os.path.split(latest_file)[1].replace('pdf','csv'), 'w', newline='\n') as csvfile:
        fieldnames = ['stat', 'cases']
        writer = csv.writer(csvfile,delimiter=',')
        writer.writerow(fieldnames)

        for i in stats:
            writer.writerow([i, stats[i]])

# save the data to the webpage folder
print("loading current file")
jsonPath = os.path.dirname(os.getcwd())+"\\docs\\data\\cases.json";
jsonData = {}
with open(jsonPath, 'r') as f:
    jsonData = json.load(f)

latest = re.compile(r'\d-\d\d-\d\d\d\d').search(latest_file).group()

if not latest in jsonData.keys():
    jsonData[latest] = counties
    with open(jsonPath, 'w') as json_file:
        json.dump(jsonData, json_file)
        print("wrote new entry to file")
else:
    print("no new entries to write to file, deleting duplicate download")
    os.remove(latest_file)
    
    



