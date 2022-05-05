##
# Created by: @ibadus#0300
# Twitter: https://twitter.com/ibadus_
# Creation-Date: 2022-05-05
##
import string
import configparser
import requests
import re
from discord_webhook import DiscordWebhook, DiscordEmbed
from time import sleep

PATH_CONFIG = "config.txt"

Parser = configparser.ConfigParser()
Parser.read(PATH_CONFIG)
disc_Webhook = Parser.get("config", "discord_webhook")
email = Parser.get("config", "email")
password = Parser.get("config", "password")
if (email == "" or password == "" or disc_Webhook == ""):
	print("Please fill config.txt")
	exit(1)

loginUTF8Phrase = "✓"
loginPhrase = "Se connecter"

session = requests.Session()

def findCSRF(body: string) -> string:
	result = re.search(r"name=\"csrf-token\" content=\"(.+?)\"", body)
	if len(result.groups()) == 0:
		return ""
	return result.group(1)

def getCSRF() -> string:
	try:
		response = session.get("https://candidature.1337.ma/users/sign_in", headers={
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
			"accept-language": "en-us",
			"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36"
		})
		if (response.status_code != 200):
			print("Error on Login: " + str(response.status_code))
			return ""
		return findCSRF(response.text)
	except Exception as e:
		print("Error on Login, ip might be temporary blocked, sleeping 30s")
		sleep(30)
		return ""


def login(csrf: string) -> bool:
	try:
		response = session.post("https://candidature.1337.ma/users/sign_in", data={
			"utf8": loginUTF8Phrase,
			"authenticity_token": csrf, # TODO: GET BODY
			"user[email]": email,
			"user[password]": password,
			"commit": loginPhrase
		}, headers={
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			'Content-Type': 'application/x-www-form-urlencoded',
			"accept-language": "fr,en-US;q=0.9,en;q=0.8",
			"referer": "https://candidature.1337.ma/users/sign_in",
			"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36"
		})
		if (response.url != "https://candidature.1337.ma/meetings"):
			print("Not logged in, there might be an issue with your login informations")
			return False
		return True
	except Exception as e:
		print("Error on Login, ip might be temporary blocked, sleeping 30s")
		sleep(30)
		return False

def checkAvailabilty() -> bool:
	try: 
		response = session.get("https://candidature.1337.ma/meetings", headers={
			"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
			"accept-language": "fr,en-US;q=0.9,en;q=0.8",
			"user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.127 Safari/537.36"
		})
		if (response.status_code != 200):
			print("Error getting page: " + str(response.status_code))
			return False
		if (response.url != "https://candidature.1337.ma/meetings"):
			print("Not logged in")
			return False
		if (response.text.find("De nouveaux creneaux ouvriront prochainement") != -1):
			return False
		return True
	except Exception as e:
		print("Error on Monitorin, ip might be temporary blocked, sleeping 30s")
		sleep(30)
		return False

def sendWebhook():
	webhook = DiscordWebhook(url=disc_Webhook, rate_limit_retry=True)
	embed = DiscordEmbed(
		title="Nouveau creneau disponible",
		url="https://candidature.1337.ma/meetings",
	)
	webhook.add_embed(embed)
	webhook.execute()

if __name__ == "__main__":
	print("Starting...")
	csrf = getCSRF()
	if (csrf == ""):
		print("Error Getting login token")
		exit(1)
	if (login(csrf) == False):
		print("Error Loging in")
		exit(1)

	while True:
		if (checkAvailabilty()):
			sendWebhook()
			print("Available!")
		print("Sleeping 3s, before checking again")
		sleep(3)