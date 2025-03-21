import { Api, TelegramClient } from "telegram";
import {
  SALE_ADMIN_APP_ID,
  SALE_ADMIN_APP_HASH,
  SALE_ADMIN_SESSION_STRING,
} from "./config";
import { StringSession } from "telegram/sessions";
import { NewMessage, NewMessageEvent } from "telegram/events";
import * as fs from "fs";
import * as path from "path";
import * as XLSX from "xlsx";
import { database } from "./services";
import { EntryPoint, UserState } from "./types";

// ID của nhóm báo cáo từ URL: https://web.telegram.org/k/#-4685338130
const REPORT_GROUP_ID = -4685338130;

// Thư mục lưu file tải về
const DOWNLOAD_DIR = path.join(__dirname, "../data/downloads");

export async function startClient() {
  try {
    // Đảm bảo thư mục download tồn tại
    if (!fs.existsSync(DOWNLOAD_DIR)) {
      fs.mkdirSync(DOWNLOAD_DIR, { recursive: true });
    }

    const client = new TelegramClient(
      new StringSession(SALE_ADMIN_SESSION_STRING),
      Number(SALE_ADMIN_APP_ID),
      SALE_ADMIN_APP_HASH,
      {
        connectionRetries: 5,
        useWSS: true,
      }
    );
    await client.connect();
    const isAuthorized = await client.checkAuthorization();
    if (!isAuthorized) {
      throw new Error("Client is not authorized");
    }
    return client;
  } catch (error) {
    console.error("Client failed to start", error);
    throw error;
  }
}

export async function clientConfig(client: TelegramClient) {
  // Lắng nghe tin nhắn mới trong nhóm báo cáo
  client.addEventHandler(
    async (event) => handleNewMessage(event, client),
    new NewMessage({
      chats: [REPORT_GROUP_ID], // Chỉ lắng nghe tin nhắn từ nhóm báo cáo
    })
  );

  console.log(
    `Started listening for messages in report group ${REPORT_GROUP_ID}`
  );
  return;
}

/**
 * Kiểm tra xem file có phải là Excel hoặc CSV không dựa trên tên file
 */
function isExcelOrCSV(fileName: string): boolean {
  const lowerCase = fileName.toLowerCase();
  return (
    lowerCase.endsWith(".xlsx") ||
    lowerCase.endsWith(".xls") ||
    lowerCase.endsWith(".csv")
  );
}

/**
 * Tải file từ message và lưu vào thư mục cục bộ
 */
async function downloadFileFromMessage(
  client: TelegramClient,
  message: any
): Promise<string | null> {
  try {
    // Đảm bảo message có media
    if (!message.media) return null;

    // Tạo tên file duy nhất với timestamp
    const timestamp = new Date().getTime();
    const fileName = `file_${timestamp}`;
    const filePath = path.join(DOWNLOAD_DIR, fileName);

    console.log("Starting to download file...");

    // Tải file từ message
    const buffer = await client.downloadMedia(message.media, {});

    if (!buffer) {
      console.error("Failed to download file: Buffer is empty");
      return null;
    }

    // Lưu file vào đĩa
    fs.writeFileSync(filePath, buffer);
    console.log(`File downloaded and saved to: ${filePath}`);

    return filePath;
  } catch (error) {
    console.error("Error downloading file:", error);
    return null;
  }
}

/**
 * Cố gắng lấy tên file từ document
 */
function getFilenameFromDocument(document: any): string | null {
  try {
    // Sử dụng type casting cho document
    const doc = document as any;

    // Trường hợp 1: document có thuộc tính attributes
    if (doc && doc.attributes && Array.isArray(doc.attributes)) {
      for (const attr of doc.attributes) {
        if (attr.className === "DocumentAttributeFilename" && attr.fileName) {
          return attr.fileName;
        }
      }
    }

    // Trường hợp 2: document có thuộc tính fileName trực tiếp
    if (doc && doc.fileName) {
      return doc.fileName;
    }

    // Trường hợp 3: Thử lấy từ các trường khác
    if (doc && doc.mimeType) {
      const mimeType = doc.mimeType.toString();
      if (
        mimeType.includes("spreadsheet") ||
        mimeType.includes("excel") ||
        mimeType.includes("csv")
      ) {
        // Tạo tên file giả dựa trên mime type
        const ext = mimeType.includes("csv") ? ".csv" : ".xlsx";
        return `file_${new Date().getTime()}${ext}`;
      }
    }

    return null;
  } catch (error) {
    console.error("Error getting filename from document:", error);
    return null;
  }
}

/**
 * Đọc và xử lý file Excel hoặc CSV thành mảng các object
 * @param filePath Đường dẫn đến file cần xử lý
 * @returns Mảng các object, mỗi object đại diện cho một hàng trong file Excel/CSV
 */
function processExcelFile(filePath: string): any[] {
  try {
    console.log(`Processing file: ${filePath}`);

    // Đọc file
    const workbook = XLSX.readFile(filePath);

    // Lấy tên sheet đầu tiên
    const firstSheetName = workbook.SheetNames[0];
    console.log(`Reading from sheet: ${firstSheetName}`);

    // Lấy dữ liệu từ sheet
    const worksheet = workbook.Sheets[firstSheetName];

    // Chuyển đổi thành mảng các object (header ở dòng đầu tiên)
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    console.log(`Parsed ${data.length} rows from file`);
    console.log(
      "Sample data (first row):",
      data.length > 0 ? data[0] : "No data"
    );

    return data;
  } catch (error) {
    console.error("Error processing Excel/CSV file:", error);
    return [];
  }
}

/**
 * Xử lý CSV thành mảng các object (sử dụng khi phát hiện là file CSV)
 * @param filePath Đường dẫn đến file CSV
 * @returns Mảng các object
 */
function processCSVFile(filePath: string): any[] {
  try {
    console.log(`Processing CSV file: ${filePath}`);

    // Đọc file CSV với header ở dòng đầu
    const options = {
      raw: false,
      dateNF: "yyyy-mm-dd", // Format ngày tháng
      header: 1, // Lấy dòng đầu tiên làm header
    };

    // Đọc nội dung file
    const content = fs.readFileSync(filePath, "utf8");

    // Parse CSV
    const workbook = XLSX.read(content, { type: "string" });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    // Chuyển đổi thành mảng các object
    const data = XLSX.utils.sheet_to_json(worksheet, { raw: false });

    console.log(`Parsed ${data.length} rows from CSV file`);
    console.log(
      "Sample data (first row):",
      data.length > 0 ? data[0] : "No data"
    );

    return data;
  } catch (error) {
    console.error("Error processing CSV file:", error);
    return [];
  }
}

/**
 * Xử lý tin nhắn mới từ nhóm báo cáo
 */
async function handleNewMessage(
  event: NewMessageEvent,
  client: TelegramClient
) {
  try {
    console.log("New message received: ", event.message.text);

    // Lấy ID người gửi tin nhắn
    const message = event.message;
    const senderId = message.senderId?.toString() || "";
    console.log("sender ID: ", senderId);

    // Lấy thông tin của client
    const clientInfo = await client.getMe();
    console.log("client info: ", clientInfo);

    // ID của client (tài khoản đang sử dụng)
    const clientId = clientInfo?.id?.toString() || "";
    console.log("client ID: ", clientId);

    // So sánh ID người gửi với ID của client
    const isOwnMessage = senderId === clientId;
    console.log("Is this my own message? ", isOwnMessage);

    // Xử lý tin nhắn chứa file
    if (message.media) {
      console.log("Message contains media");

      // Kiểm tra loại media
      if (message.media instanceof Api.MessageMediaDocument) {
        console.log("Media is a document");

        // Lấy thông tin document
        const document = message.media.document;

        if (document) {
          console.log("Document info:", document);

          // Lấy tên file an toàn không phụ thuộc vào cấu trúc
          const fileName = getFilenameFromDocument(document);

          if (fileName) {
            console.log("Filename:", fileName);

            // Kiểm tra nếu file là Excel hoặc CSV
            if (isExcelOrCSV(fileName)) {
              console.log("File is an Excel or CSV file");

              // Tải file xuống
              const filePath = await downloadFileFromMessage(client, message);

              if (filePath) {
                console.log(`Excel/CSV file downloaded to: ${filePath}`);

                // Xử lý file Excel/CSV
                let data = [];
                if (fileName.toLowerCase().endsWith(".csv")) {
                  data = processCSVFile(filePath);
                } else {
                  data = processExcelFile(filePath);
                }

                // Kiểm tra kết quả
                if (data && data.length > 0) {
                  console.log(
                    `Successfully processed file with ${data.length} rows of data`
                  );
                  for (const row of data) {
                    console.log(row);
                    if (row["Tele Handle"]) {
                      // get telegram user info
                      const user = await client.getEntity(row["Tele Handle"]);
                      console.log(user);
                      // check in database if user is already in database
                      const userInDatabase = await database.getUser(
                        Number(user.id)
                      );
                      if (!userInDatabase) {
                        // add user to database
                        await database.createUser(
                          Number(user.id),
                          EntryPoint.DEFAULT,
                          (user as Api.User).username,
                          (user as Api.User).firstName,
                          (user as Api.User).lastName,
                          EntryPoint.DEFAULT,
                          row["Status"]
                        );
                      } else {
                        // update user in database
                        await database.updateUser(Number(user.id), {
                          state: row["Status"],
                        });
                      }
                    }
                  }

                  // Gửi phản hồi về nhóm với tóm tắt dữ liệu
                  const summary = `Đã xử lý file ${fileName} với ${data.length} dòng dữ liệu.`;
                  await client.sendMessage(REPORT_GROUP_ID, {
                    message: summary,
                  });

                  // TODO: Thêm xử lý dữ liệu ở đây
                  // Ví dụ: lưu vào database, phân tích, v.v.
                } else {
                  await client.sendMessage(REPORT_GROUP_ID, {
                    message: `Đã nhận file ${fileName} nhưng không có dữ liệu hoặc có lỗi khi xử lý.`,
                  });
                }
              } else {
                console.error("Failed to download file");
              }
            }
          } else {
            console.log(
              "Could not determine filename, trying to download anyway"
            );
            const filePath = await downloadFileFromMessage(client, message);
            if (filePath) {
              console.log(
                `File downloaded to: ${filePath}, but type could not be determined`
              );
            }
          }
        }
      } else if (message.media instanceof Api.MessageMediaPhoto) {
        console.log("Media is a photo - not processing");
      } else {
        console.log("Media is of unknown type:", message.media.className);
      }
    }

    // Nếu là tin nhắn của chính mình, thoát ra
    if (isOwnMessage) {
      return;
    }
  } catch (error) {
    console.error("Lỗi khi xử lý tin nhắn từ nhóm báo cáo:", error);
  }
}

// Hàm mẫu để hiển thị cách sử dụng dữ liệu từ file Excel/CSV
function exampleProcessData(data: any[]): void {
  // Ví dụ lọc dữ liệu
  const filteredData = data.filter((row) => {
    // Ví dụ: Lọc các hàng có giá trị cột 'Status' là 'Active'
    return row.Status === "Active";
  });

  // Ví dụ tính tổng
  let total = 0;
  data.forEach((row) => {
    // Ví dụ: Tính tổng cột 'Amount' nếu có
    if (row.Amount && !isNaN(parseFloat(row.Amount))) {
      total += parseFloat(row.Amount);
    }
  });

  // Ví dụ nhóm dữ liệu
  const groupedData: Record<string, any[]> = {};
  data.forEach((row) => {
    // Ví dụ: Nhóm theo cột 'Department'
    const key = row.Department || "Unknown";
    if (!groupedData[key]) {
      groupedData[key] = [];
    }
    groupedData[key].push(row);
  });

  console.log("Filtered data count:", filteredData.length);
  console.log("Total sum:", total);
  console.log("Grouped data keys:", Object.keys(groupedData));
}
