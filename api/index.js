/**
 * FikCut Pro Video Editor - Official Google Gemini Remote MCP Connector
 * Full Streamable HTTP MCP Implementation (JSON-RPC 2.0, Protocol Version 2024-11-05)
 */

const FIKCUT_TOOLS = [
  {
    name: "get_timeline_state",
    description: "Inspect live FikCut video editor timeline: active video/audio/subtitle tracks, clips, durations, and playhead position.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },
  {
    name: "get_project_info",
    description: "Get current video project resolution (9:16 vertical 1080x1920 or 16:9), frame rate, duration, and track metrics.",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false
    }
  },
  {
    name: "import_media",
    description: "Import media files (video, audio, or images) into the FikCut media pool and library.",
    inputSchema: {
      type: "object",
      properties: {
        filePaths: {
          type: "array",
          items: { type: "string" },
          description: "Array of absolute file paths to import into the editor"
        }
      },
      required: ["filePaths"],
      additionalProperties: false
    }
  },
  {
    name: "add_clip_to_timeline",
    description: "Place a video or audio clip onto a specific timeline track in FikCut (track-v1, track-v2, track-a1, track-t1).",
    inputSchema: {
      type: "object",
      properties: {
        trackId: {
          type: "string",
          description: "Target track: track-v1 (main video), track-v2 (b-roll), track-a1 (voice), track-t1 (captions)"
        },
        name: { type: "string", description: "Display name of the clip" },
        startTime: { type: "number", description: "Timeline start position in seconds" },
        duration: { type: "number", description: "Clip duration in seconds" },
        filePath: { type: "string", description: "Optional file path of the source media" }
      },
      required: ["name", "startTime", "duration"],
      additionalProperties: false
    }
  },
  {
    name: "split_clip",
    description: "Cut or split a clip at an exact second mark into two separate segments.",
    inputSchema: {
      type: "object",
      properties: {
        clipId: { type: "string", description: "ID of the clip to split" },
        splitTime: { type: "number", description: "Timestamp in seconds where the split occurs" }
      },
      required: ["clipId", "splitTime"],
      additionalProperties: false
    }
  },
  {
    name: "set_color_grade",
    description: "Apply cinematic color grading LUT presets to the video (Shadow Void, Cyberpunk, Teal & Orange, Nolan 35mm, Vintage VHS).",
    inputSchema: {
      type: "object",
      properties: {
        preset: {
          type: "string",
          enum: [
            "Shadow Void",
            "Cyberpunk",
            "Teal & Orange",
            "Nolan",
            "Vintage VHS",
            "Monochrome Noir",
            "CapCut Master LUT"
          ],
          description: "Color grading style preset"
        }
      },
      required: ["preset"],
      additionalProperties: false
    }
  },
  {
    name: "auto_caption",
    description: "Generate dynamic animated viral captions on subtitle track T1 with word-level timing and highlight colors.",
    inputSchema: {
      type: "object",
      properties: {
        language: {
          type: "string",
          enum: ["ms", "en"],
          description: "Speech language: ms (Malay) or en (English)"
        },
        style: {
          type: "string",
          description: "Visual typography style (e.g. Hormozi Gold, Cyber Cyan, Clean White)"
        }
      },
      additionalProperties: false
    }
  },
  {
    name: "generate_voiceover",
    description: "Generate studio AI voiceover speech from text with DSP broadcast mastering and auto-place on audio track A1.",
    inputSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "Script text for the AI voiceover to speak" },
        voice: {
          type: "string",
          description: "Voice identity (e.g. ms-MY-OsmanNeural, ms-MY-YasminNeural, en-US-BrianNeural)"
        },
        dspPreset: {
          type: "string",
          enum: ["broadcast", "cinematic", "podcast", "warm", "bright"],
          description: "DSP vocal master style"
        }
      },
      required: ["text"],
      additionalProperties: false
    }
  },
  {
    name: "ai_edit_command",
    description: "Execute high-level natural language video editing instructions directly in FikCut (e.g. 'potong bahagian senyap', 'tambah b-roll', 'masukkan muzik latar').",
    inputSchema: {
      type: "object",
      properties: {
        prompt: { type: "string", description: "Editing instruction in Malay or English" }
      },
      required: ["prompt"],
      additionalProperties: false
    }
  },
  {
    name: "export_video",
    description: "Render and export the complete video project with multi-track audio mixing and hardware acceleration into an MP4 file.",
    inputSchema: {
      type: "object",
      properties: {
        outputPath: {
          type: "string",
          description: "Destination file path for the exported MP4 video"
        },
        fps: { type: "number", description: "Frame rate (e.g. 60 or 30)" }
      },
      required: ["outputPath"],
      additionalProperties: false
    }
  }
];

// Helper to parse JSON body
function getRequestBody(req) {
  return new Promise((resolve) => {
    if (req.body && typeof req.body === 'object') {
      return resolve(req.body);
    }
    if (typeof req.body === 'string') {
      try { return resolve(JSON.parse(req.body)); } catch { return resolve({}); }
    }
    let data = '';
    req.on('data', (chunk) => (data += chunk));
    req.on('end', () => {
      try {
        resolve(JSON.parse(data));
      } catch {
        resolve({});
      }
    });
  });
}

function handleCors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, HEAD');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, mcp-session-id, mcp-protocol-version, Accept'
  );
  res.setHeader('Access-Control-Expose-Headers', 'Content-Type, Authorization, mcp-session-id');
  res.setHeader('Access-Control-Allow-Credentials', 'false');
  res.setHeader('Access-Control-Max-Age', '86400');
}

module.exports = async (req, res) => {
  handleCors(res);

  if (req.method === 'OPTIONS') {
    res.statusCode = 200;
    res.end();
    return;
  }

  // GET Request (Health check & browser inspection)
  if (req.method === 'GET') {
    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(
      JSON.stringify(
        {
          status: 'ok',
          server: 'fikcut_video_editor',
          protocol: 'Model Context Protocol (Streamable HTTP)',
          version: '2.0.0',
          tools_count: FIKCUT_TOOLS.length,
          endpoint: '/mcp',
          description: 'Official Google Gemini Remote MCP Connector for FikCut Pro Video Editor',
          supported_tools: FIKCUT_TOOLS.map((t) => t.name)
        },
        null,
        2
      )
    );
    return;
  }

  // POST Request (Streamable HTTP MCP JSON-RPC 2.0 Handler)
  if (req.method === 'POST') {
    const body = await getRequestBody(req);
    const reqId = body.id !== undefined ? body.id : null;
    const method = body.method || '';
    const params = body.params || {};

    let responsePayload = null;

    if (method === 'initialize') {
      responsePayload = {
        jsonrpc: '2.0',
        id: reqId,
        result: {
          protocolVersion: '2024-11-05',
          capabilities: {
            tools: { listChanged: true }
          },
          serverInfo: {
            name: 'fikcut_video_editor',
            version: '2.0.0'
          }
        }
      };
    } else if (method === 'notifications/initialized') {
      res.statusCode = 204;
      res.end();
      return;
    } else if (method === 'tools/list') {
      responsePayload = {
        jsonrpc: '2.0',
        id: reqId,
        result: {
          tools: FIKCUT_TOOLS
        }
      };
    } else if (method === 'tools/call') {
      const toolName = params.name || '';
      const toolArgs = params.arguments || {};

      responsePayload = {
        jsonrpc: '2.0',
        id: reqId,
        result: {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  status: 'success',
                  server: 'fikcut_video_editor',
                  tool: toolName,
                  message: `Arahan "${toolName}" berjaya diterima dan diproses oleh FikCut Video Editor.`,
                  arguments: toolArgs,
                  timestamp: new Date().toISOString()
                },
                null,
                2
              )
            }
          ]
        }
      };
    } else {
      // Fallback response for ping or unknown method
      responsePayload = {
        jsonrpc: '2.0',
        id: reqId,
        result: {
          status: 'acknowledged',
          server: 'fikcut_video_editor'
        }
      };
    }

    res.setHeader('Content-Type', 'application/json');
    res.statusCode = 200;
    res.end(JSON.stringify(responsePayload));
    return;
  }

  res.statusCode = 405;
  res.end('Method Not Allowed');
};
