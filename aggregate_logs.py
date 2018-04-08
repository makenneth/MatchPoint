from optparse import OptionParser
from elasticsearch import Elasticsearch
from pprint import pprint
import json
import logging

logger = logging.getLogger("aggregator")
hdlr = logging.FileHandler("/var/tmp/aggregator.log")
formatter = logging.Formatter('%(asctime)s %(levelname)s %(message)s')
hdlr.setFormatter(formatter)
logger.addHandler(hdlr)

class AggregateLog:
  def __init__(self, client, filename):
    self.filename = filename
    self.client = client

  def aggregate(self):
    with open(self.filename, "r") as file:
      for line in file:
        data = json.loads(line)
        self.save(data)

  def save(self, data):
    try:
      client.index(
        index="error_logs",
        doc_type="document",
        body={
          "name": data["name"],
          "description": data["description"]
        },
      )
    except Exception as e:
      print(e)
      logger.error("Failed to append {}. Error: {}".format(json.dumps(data), str(e)))

  def search(self, index):
    results = client.search(index="error_logs", doc_type="document")
    print(results)

parser = OptionParser()
parser.add_option("-c", "--config", dest="config_file",
                  help="specify config file", metavar="config_file")

# run every minute to append to elasticsearch
if __name__ == '__main__':
  (options, args) = parser.parse_args()
  if not options.config_file:
    raise Error("config file required")
  client = Elasticsearch()
  client.indices.create(index="error_logs", ignore=400)
  AggregateLog(client, options.config_file).aggregate()

