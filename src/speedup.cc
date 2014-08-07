#include <node.h>
#include <nan.h>
#include <stdlib.h>

#ifdef _MSC_VER
// Windows header
# include <Windows.h>
#else
// Unix header
# include <dirent.h>
# include <sys/stat.h>
#endif

using namespace v8;


#ifdef _MSC_VER
// Windows system call

bool IsCurrentDir(const wchar_t* name) {
    if(name[0] == L'.') {
        return name[1] == L'\0' || (name[1] == L'.' && name[2] == L'\0');
    }
    return false;
}

bool ReaddirImpl(Local<String>& path, Local<Array>& result) {
    int len = path->Length();
    wchar_t* path_buf = new wchar_t[len + 3];

    int wrote = path->Write((uint16_t*) path_buf);
    if(wrote < 1) {
        goto fail;
    }

    if(path_buf[len - 1] == L'\\') {
        path_buf[len] = L'*';
        path_buf[len + 1] = L'\0';
    } else {
        path_buf[len] = L'\\';
        path_buf[len + 1] = L'*';
        path_buf[len + 2] = L'\0';
    }

    WIN32_FIND_DATAW find_data;
    HANDLE handle = FindFirstFileW(path_buf, &find_data);
    if(handle == INVALID_HANDLE_VALUE) {
        goto fail;
    }

    int index = 0;
    do {
        if(! IsCurrentDir(find_data.cFileName)) {
            Local<String> filename = NanNew((uint16_t*) find_data.cFileName);
            result->Set(index++, filename);
        }
    } while(FindNextFileW(handle, &find_data));

    FindClose(handle);
    delete[] path_buf;
    return true;

fail:
    delete[] path_buf;
    return false;
}

DWORD GetAttr(Local<String>& path) {
    String::Value path_value(path);
    if(*path_value == NULL) {
        return INVALID_FILE_ATTRIBUTES;
    }
    return GetFileAttributesW((const wchar_t*) *path_value);
}

bool IsSymbolicLinkImpl(Local<String>& path) {
    DWORD attr = GetAttr(path);
    if(attr == INVALID_FILE_ATTRIBUTES) {
        return false;
    }
    return attr & FILE_ATTRIBUTE_REPARSE_POINT;
}

bool ExistsImpl(Local<String>& path) {
    return GetAttr(path) != INVALID_FILE_ATTRIBUTES;
}

#else
// Unix system call

bool IsCurrentDir(const char* name) {
    if(name[0] == '.') {
        return name[1] == '\0' || (name[1] == '.' && name[2] == '\0');
    }
    return false;
}

bool ReaddirImpl(Local<String>& path, Local<Array>& result) {
    String::Utf8Value path_value(path);
    if(*path_value == NULL) {
        return false;
    }

    struct dirent** namelist;
    int size = scandir(*path_value, &namelist, NULL, alphasort);
    if(size < 0) {
        return false;
    }

    int index = 0;
    for(int i = 0; i < size; i++) {
        if(IsCurrentDir(namelist[i]->d_name) == false) {
            Local<String> filename = NanNew(namelist[i]->d_name);
            result->Set(index++, filename);
        }
        free(namelist[i]);
    }

    free(namelist);
    return true;
}

bool IsSymbolicLinkImpl(Local<String>& path) {
    String::Utf8Value path_value(path);
    if(*path_value == NULL) {
        return false;
    }

    struct stat st;
    int err = lstat(*path_value, &st);
    if(err) {
        return false;
    }

    return st.st_mode & S_IFLNK;
}

bool ExistsImpl(Local<String>& path) {
    String::Utf8Value path_value(path);
    if(*path_value == NULL) {
        return false;
    }

    struct stat st;
    return stat(*path_value, &st) == 0;
}

#endif

NAN_METHOD(Readdir) {
    NanScope();
    assert(args.Length() == 1);
    assert(args[0]->IsString());

    Local<Array> result = NanNew<Array>();
    Local<String> path = args[0]->ToString();
    bool success = ReaddirImpl(path, result);

    if(success) {
        NanReturnValue(result);
    } else {
        NanReturnValue(NanNull());
    }
}

NAN_METHOD(IsSymbolicLink) {
    NanScope();
    assert(args.Length() == 1);
    assert(args[0]->IsString());

    Local<String> path = args[0]->ToString();
    bool is_sym = IsSymbolicLinkImpl(path);
    NanReturnValue(is_sym ? NanTrue() : NanFalse());
}

NAN_METHOD(Exists) {
    NanScope();
    assert(args.Length() == 1);
    assert(args[0]->IsString());

    Local<String> path = args[0]->ToString();
    bool exists = ExistsImpl(path);
    NanReturnValue(exists ? NanTrue() : NanFalse());
}

void Init(Handle<Object> exports) {
    NanScope();
    NODE_SET_METHOD(exports, "readdirSyncSafe", Readdir);
    NODE_SET_METHOD(exports, "isSymbolicLinkSync", IsSymbolicLink);
    NODE_SET_METHOD(exports, "existsSync", Exists);
}

NODE_MODULE(speedup, Init)
