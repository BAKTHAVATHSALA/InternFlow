# SLA CONFIGURATION
DEMO_MODE = True

if DEMO_MODE:
    # All values in seconds for fast demo
    REFERRAL_EXPIRY = 5 * 60           # 5 mins
    JOINING_FORM_EXPIRY = 5 * 60       # 5 mins
    NDA_EXPIRY = 5 * 60                # 5 mins
    REMINDER_TIME = 90                  # 1.5 mins
    MAGIC_LINK_EXPIRY = 2 * 60         # 2 mins
    ACCESS_AFTER_COMPLETION = 5 * 60    # 5 mins
    OTP_EXPIRY = 5 * 60                # 5 mins
    JWT_EXPIRY = 10 * 60               # 10 mins
else:
    # Production values in seconds
    REFERRAL_EXPIRY = 24 * 60 * 60      # 1 day
    JOINING_FORM_EXPIRY = 24 * 60 * 60  # 1 day
    NDA_EXPIRY = 24 * 60 * 60           # 1 day
    REMINDER_TIME = 20 * 60 * 60        # 20 hours
    MAGIC_LINK_EXPIRY = 15 * 60         # 15 mins
    ACCESS_AFTER_COMPLETION = 3 * 24 * 60 * 60 # 3 days
    OTP_EXPIRY = 10 * 60               # 10 mins
    JWT_EXPIRY = 7 * 24 * 60 * 60      # 7 days
