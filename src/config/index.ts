export default () => ({
  nodeEnv: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10) || 3000,
  cors: {
    origin: (process.env.CORS_ORIGIN ?? '')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean),
  },
  db: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    dialect: process.env.DB_DIALECT || 'postgres',
    ssl: process.env.DB_SSL === 'true',
    synchronize: process.env.DB_SYNC === 'true',
    min: parseInt(process.env.DB_POOL_MIN, 10),
    max: parseInt(process.env.DB_POOL_MAX, 10),
    idle: parseInt(process.env.DB_POOL_IDLE, 10),
    evict: parseInt(process.env.DB_POOL_EVICT, 10),
    logging: process.env.DB_LOGGING === 'true',
  },
  kafkaConfig: {
    client: {
      clientId: process.env.KAFKA_CLIENT_ID,
      brokers:
        process.env.KAFKA_BOOTSTRAP_SERVERS_LOCAL?.split(',') ??
        process.env.KAFKA_BOOTSTRAP_SERVERS?.split(',') ??
        [],
    },
    consumer: {
      groupId: process.env.KAFKA_CONSUMER_GROUP_ID,
    },
  },
  redisConfig: {
    host: process.env.REDIS_HOST_LOCAL || process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT_LOCAL || process.env.REDIS_PORT, 10),
    url: process.env.REDIS_URL_LOCAL || process.env.REDIS_URL,
    authHost: process.env.AUTH_REDIS_HOST_LOCAL || process.env.AUTH_REDIS_HOST,
    authPort: parseInt(
      process.env.AUTH_REDIS_PORT_LOCAL || process.env.AUTH_REDIS_PORT,
      10,
    ),
    authPassword:
      process.env.AUTH_REDIS_PASSWORD_LOCAL || process.env.AUTH_REDIS_PASSWORD,
    queueUsername: process.env.REDIS_QUEUE_USERNAME,
    queuePassword: process.env.REDIS_QUEUE_PASSWORD,
  },
  baseUrl: {
    auth: process.env.AUTH_SERVICE_API_URL,
    authLogin: process.env.AUTH_LOGIN_SERVICE_API_URL,
    accountEnquiries: process.env.ACCOUNT_ENQUIRIES_SERVICE_API_URL,
    accountManagement: process.env.ACCOUNT_MANAGEMENT_SERVICE_API_URL,
    accountRestriction: process.env.ACCOUNT_RESTRICTION_MANAGER_SERVICE_API_URL,
    accountOpening: process.env.ACCOUNT_OPENING_SERVICE_API_URL,
    centralJournalPosting: process.env.CENTRAL_JOURNAL_POSTING_API_URL,
    chartOfAccounts: process.env.CHART_OF_ACCOUNTS_API_URL,
    currency: process.env.CURRENCY_API_URL,
    customerManagement: process.env.CUSTOMER_MANAGEMENT_API_URL,
    documentManagement: process.env.DMS_API_URL,
    fiscalPeriod: process.env.FISCAL_PERIOD_API_URL,
    productManagement: process.env.PRODUCT_MANAGEMENT_API_URL,
    tradeGov: process.env.TRADE_GOV_API_URL,
    tradeGovAuth: process.env.TRADE_GOV_AUTH_API_URL,
    tradeProductFactory: process.env.TRADE_PRODUCT_FACTORY_API_URL,
    compliance: process.env.COMPLIANCE_URL,
    treasuryTrade: process.env.TREASURY_TRADE_API_URL,
    onePlug: process.env.ONE_PLUG_SERVICE_API_URL,
    trms: process.env.TRMS_API_URL,
    concessionGroup: process.env.CONCESSION_GROUP_API_URL,
    tradeRules: process.env.TRADE_RULES_API_URL,
  },
  credentials: {
    authUsername: process.env.AUTH_USERNAME,
    authPassword: process.env.AUTH_PASSWORD,
    camsApiKey: process.env.CAMS_API_KEY,
    camsAppId: process.env.CAMS_APP_ID,
    systemUser: process.env.SYSTEM_USER,
    systemPassword: process.env.SYSTEM_PASSWORD,
    tradeGovAuthUsername: process.env.TRADE_GOV_AUTH_USERNAME,
    tradeGovAuthPassword: process.env.TRADE_GOV_AUTH_PASSWORD,
    tradeGovAuthClientId: process.env.TRADE_GOV_AUTH_CLIENT_ID,
    tradeGovAuthGrantType: process.env.TRADE_GOV_AUTH_GRANT_TYPE,
    complianceServiceIV: process.env.COMPLIANCE_SERVICE_IV,
    complianceServiceKey: process.env.COMPLIANCE_SERVICE_SECRET_KEY,
    onePlugServiceEmail: process.env.ONE_PLUG_SERVICE_EMAIL,
    onePlugServicePassword: process.env.ONE_PLUG_SERVICE_PASSWORD,
    onePlugServiceIV: process.env.ONE_PLUG_SERVICE_IV,
    onePlugServiceKey: process.env.ONE_PLUG_SERVICE_SECRET_KEY,
    onePlugServiceEndpointEmail: process.env.ONE_PLUG_SERVICE_ENDPOINT_EMAIL,
    onePlugServiceEndpointPassword:
      process.env.ONE_PLUG_SERVICE_ENDPOINT_PASSWORD,
    onePlugServiceEndpointSecretKey:
      process.env.ONE_PLUG_SERVICE_ENDPOINT_SECRET_KEY,
    onePlugServiceEndpointSecretIv:
      process.env.ONE_PLUG_SERVICE_ENDPOINT_SECRET_IV,
    trmsBasicAuthUsername: process.env.TRMS_BASIC_AUTH_USERNAME,
    trmsBasicAuthPassword: process.env.TRMS_BASIC_AUTH_PASSWORD,
    trmsUsername: process.env.TRMS_USERNAME,
    trmsPassword: process.env.TRMS_PASSWORD,
    trmsGrantType: process.env.TRMS_GRANT_TYPE,
  },
  elasticSearch: {
    host: process.env.ELASTIC_SEARCH_HOST || 'localhost:9200',
    username: process.env.ELASTIC_SEARCH_USERNAME,
    password: process.env.ELASTIC_SEARCH_PASSWORD,
    indexName: process.env.ELASTIC_SEARCH_INDEX_NAME || 'trade-api',
    indexSuffixPattern:
      process.env.ELASTIC_SEARCH_INDEX_SUFFIX_PATTERN || 'YYYY-MM-DD',
  },
  sftp: {
    swift: {
      host: process.env.SWIFT_SFTP_HOST,
      port: parseInt(process.env.SWIFT_SFTP_PORT, 10),
      username: process.env.SWIFT_SFTP_USERNAME,
      password: process.env.SWIFT_SFTP_PASSWORD,
      remoteBasePath: process.env.SWIFT_REMOTE_BASE_PATH,
      connectionMode: process.env.SWIFT_CONNECTION_MODE,
      debug: process.env.SFTP_FTP_CONNECTION_DEBUG === 'true',
    },
  },
});
