import os
import urllib
from http.server import HTTPServer, SimpleHTTPRequestHandler

dir_path = os.path.dirname(os.path.realpath(__file__))

addr = "127.0.0.1"
port = 9000

os.chdir(os.path.join(dir_path, "public"))

file = open("index.html", "r")
content = file.read()

# HTTPRequestHandler class
class RequestHandler(SimpleHTTPRequestHandler):

  # GET
  def do_GET(self):
        parsedParams = urllib.parse.urlparse(self.path)

        if os.access('.' + os.sep + parsedParams.path, os.R_OK):
            SimpleHTTPRequestHandler.do_GET(self);
            return

        # Send response status code
        self.send_response(200)
        self.send_header('Content-Type','text/html')
        self.end_headers()
        self.wfile.write(content.encode())
        return

def run(server_class=HTTPServer, handler=RequestHandler):
    print("running on {}:{}".format(addr, port))
    httpd = server_class((addr, port), handler)
    httpd.serve_forever()


run()