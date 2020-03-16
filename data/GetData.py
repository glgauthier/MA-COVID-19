from selenium import webdriver
from selenium.webdriver.common.by import By
import time, os


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