# Logger Service

## ✅ Features

- **Colored Console Output** - NestJS built-in colored logs
- **File Logging** - Automatically logs to files
- **Daily Rotation** - New file each day
- **Separate Error Logs** - Errors in dedicated file
- **Simple & Fast** - No external dependencies

## 📁 Log Files

Located in `/logs` folder:

- `app-2025-10-09.log` - All logs (info, warn, debug, errors)
- `error-2025-10-09.log` - Only errors with stack traces

Files are created daily with format: `app-YYYY-MM-DD.log`

## 🚀 Usage

### Basic Logging

```typescript
import { LoggerService } from '@/common/logger/logger.service';

@Injectable()
export class MyService {
  constructor(private readonly logger: LoggerService) {}

  someMethod() {
    // Info log (green in console + file)
    this.logger.log('Something happened', 'MyService');
    
    // Warning (yellow in console + file)
    this.logger.warn('Potential issue', 'MyService');
    
    // Error (red in console + file + error file)
    this.logger.error('Something failed', error.stack, 'MyService');
    
    // Debug (magenta in console + file, dev only)
    this.logger.debug('Debug info', 'MyService');
  }
}
```

### Activity Logging

```typescript
// Log user activity
this.logger.logActivity('CREATE', 'users', userId, { email: 'test@test.com' });

// Log update
this.logger.logActivity('UPDATE', 'products', userId, { productId: 123 });

// Log delete
this.logger.logActivity('DELETE', 'orders', userId);
```

### API Logging (Automatic)

All API requests are automatically logged:
- Method, URL, status code, response time
- User ID (if authenticated)
- Errors with stack traces

## 📝 Log Format

### Console Output (Colored):
```
[Nest] 12345  - 10/09/2025, 8:30:45 PM     LOG [MyService] Something happened
[Nest] 12345  - 10/09/2025, 8:30:46 PM    WARN [MyService] Potential issue
[Nest] 12345  - 10/09/2025, 8:30:47 PM   ERROR [MyService] Something failed
```

### File Output:
```
[2025-10-09T20:30:45.123Z] [LOG] [MyService] Something happened
[2025-10-09T20:30:46.456Z] [WARN] [MyService] Potential issue
[2025-10-09T20:30:47.789Z] [ERROR] [MyService] Something failed
Error: Something went wrong
    at MyService.someMethod (my-service.ts:45:15)
    ...
```

## 🔄 Log Rotation

- **Daily error files**: Named with current date (`error-2025-10-09.log`)
- **New file each day**: Created automatically
- **Auto-cleanup**: Keeps only last 500 errors
- **Old errors replaced**: Files don't grow indefinitely
- **Separator lines**: Each error separated by 80 `=` for easy reading

## 💡 Benefits

✅ Console + File logging
✅ No external dependencies  
✅ Simple to use
✅ Automatic API logging
✅ Colored output for development
✅ Daily file rotation
✅ Separate error tracking

Just inject and use! 🎉

