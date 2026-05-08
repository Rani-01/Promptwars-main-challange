import datetime
import os
import json

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import Flow, InstalledAppFlow
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

SCOPES = ["https://www.googleapis.com/auth/calendar"]

def get_client_config():
    """
    Constructs the OAuth client configuration from environment variables.
    This prevents hardcoding secrets in credentials.json and is secure for GitHub and Cloud Run.
    """
    client_id = os.environ.get("GOOGLE_CLIENT_ID")
    client_secret = os.environ.get("GOOGLE_CLIENT_SECRET")
    project_id = os.environ.get("GOOGLE_PROJECT_ID", "aeroplan-trip")

    if not client_id or not client_secret:
        return None

    return {
        "installed": {
            "client_id": client_id,
            "project_id": project_id,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
            "client_secret": client_secret,
            "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob", "http://localhost"]
        }
    }

def authenticate_google_calendar():
    """
    Handles OAuth2 authentication securely using Environment Variables.
    """
    creds = None
    
    # In a real Cloud Run backend, you would store the user's refresh token in your database (e.g. Supabase)
    # instead of a local token.json file. For demonstration, we check the env var first.
    token_json_str = os.environ.get("GOOGLE_USER_TOKEN_JSON")
    
    if token_json_str:
        token_data = json.loads(token_json_str)
        creds = Credentials.from_authorized_user_info(token_data, SCOPES)
    elif os.path.exists("token.json"):
        creds = Credentials.from_authorized_user_file("token.json", SCOPES)
        
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            client_config = get_client_config()
            
            if client_config:
                # Use environment variables
                flow = InstalledAppFlow.from_client_config(client_config, SCOPES)
            elif os.path.exists("credentials.json"):
                # Fallback to local file if env vars aren't set
                flow = InstalledAppFlow.from_client_secrets_file("credentials.json", SCOPES)
            else:
                raise ValueError("Missing Google OAuth credentials. Please set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET env variables.")
            
            # NOTE: run_local_server() only works locally. 
            # In Cloud Run, you must use a web flow redirect: flow.authorization_url()
            creds = flow.run_local_server(port=0)
            
        # For local caching
        with open("token.json", "w") as token:
            token.write(creds.to_json())

    return creds

def create_calendar(service, calendar_name):
    calendar = {
        'summary': calendar_name,
        'timeZone': 'UTC'
    }
    created_calendar = service.calendars().insert(body=calendar).execute()
    return created_calendar['id']

def sync_itinerary_to_calendar(itinerary_data, start_date_str="2024-06-01"):
    print("Authenticating with Google via Environment Variables...")
    creds = authenticate_google_calendar()
    
    try:
        service = build("calendar", "v3", credentials=creds)
        
        print("\nCreating new calendar: 'AeroPlan Trip'...")
        calendar_id = create_calendar(service, "AeroPlan Trip")
        print(f"Successfully created new calendar with ID: {calendar_id}")
        
        print("\nSyncing activities...")
        base_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d").date()
        
        for item in itinerary_data:
            time_str = item.get("time")
            try:
                time_obj = datetime.datetime.strptime(time_str, "%I:%M %p").time()
            except ValueError:
                time_obj = datetime.time(9, 0)
                
            start_datetime = datetime.datetime.combine(base_date, time_obj)
            end_datetime = start_datetime + datetime.timedelta(hours=1)
            
            event = {
              'summary': item.get('title'),
              'location': item.get('location', ''),
              'description': item.get('description', ''),
              'start': {
                'dateTime': start_datetime.isoformat(),
                'timeZone': 'UTC',
              },
              'end': {
                'dateTime': end_datetime.isoformat(),
                'timeZone': 'UTC',
              },
            }

            created_event = service.events().insert(calendarId=calendar_id, body=event).execute()
            print(f"Added: {item.get('title')} -> {created_event.get('htmlLink')}")

        print("\nSync Complete! Check your Google Calendar.")

    except HttpError as error:
        print(f"An API error occurred: {error}")

if __name__ == "__main__":
    sample_itinerary = [
        {
          "id": "1",
          "time": "09:00 AM",
          "title": "Breakfast at Cafe de Flore",
          "description": "Start your day with a classic French breakfast. (Vegetarian options available)",
          "location": "Cafe de Flore, Paris"
        }
    ]
    
    print("Secure OAuth2 Calendar Sync Initilized.")
    # sync_itinerary_to_calendar(sample_itinerary)
