from selenium import webdriver
from selenium.webdriver.common.by import By
from tabula import read_pdf
import time, os, glob, csv


options = webdriver.ChromeOptions()

options.add_experimental_option('prefs', {
"download.default_directory":  os.getcwd()+"\\pdf\\", #Change default directory for downloads
"download.prompt_for_download": False, #To auto download the file
"download.directory_upgrade": True,
"plugins.always_open_pdf_externally": True #It will not show PDF directly in chrome
})

    
browser = webdriver.Chrome(options=options)
browser.get('https://www.mass.gov/info-details/covid-19-cases-quarantine-and-monitoring')
try:
    time.sleep(3) # wait for the page to fully load
    browser.find_element(By.XPATH, '//button[text()="No thanks"]').click();
except:
    print("no prompt to close, continuing to download")
    
# download the newest data

browser.find_elements_by_partial_link_text("COVID-19 cases in Massachusetts as of")[0].click()
print("waiting for dowload...")
time.sleep(5)
# parse the file

# start by getting newest
list_of_files = glob.glob('pdf/*')
latest_file = max(list_of_files, key=os.path.getctime)
print("latest file is",latest_file)

df = read_pdf(latest_file)[0]

countyNames = ['Barnstable', 'Berkshire', 'Bristol', 'Essex', 'Hampden', 'Middlesex', 'Norfolk', 'Plymouth', 'Suffolk', 'Worcester', 'Unknown']
statNames =  ['Female', 'Male', 'Patient was hospitalized', 'Patient was not hospitalized', 'Under Investigation']

keys = df['Unnamed: 0'].tolist()
values = df['NUMBER OF'].tolist()

counties = {}
stats = {}
for i in range(len(keys)-1): 
    if keys[i] in countyNames:
        counties[keys[i]] = values[i]
    elif keys[i] in statNames:
        stats[keys[i]] = values[i]

print(counties)
print(stats)
        
with open('csv/cases/'+os.path.split(latest_file)[1].replace('pdf','csv'), 'w') as csvfile:
    fieldnames = ['county', 'cases']
    writer = csv.writer(csvfile,delimiter=',')
    writer.writerow(fieldnames)

    for i in counties:
        writer.writerow([i, counties[i]])
        
with open('csv/stats/'+os.path.split(latest_file)[1].replace('pdf','csv'), 'w') as csvfile:
    fieldnames = ['stat', 'cases']
    writer = csv.writer(csvfile,delimiter=',')
    writer.writerow(fieldnames)

    for i in stats:
        writer.writerow([i, stats[i]])