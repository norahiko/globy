#include <node.h>
#include <nan.h>
#include <iostream>

#ifdef _MSC_VER

#else
# include <dirent.h>
# include <stdlib.h>
#endif


using namespace v8;

bool ReaddirImpl(const char*, Local<Array>&);
bool IsCurrentDir(const char*);


#ifdef _MSC_VER
#else
bool ReaddirImpl(const char* path, Local<Array>& result) {
    if(path == NULL) {
        return false;
    }

    struct dirent** namelist;
    int size = scandir(path, &namelist, NULL, alphasort);
    if(size < 0) {
        return false;
    }

    int index = 0;
    for(int i = 0; i < size; i++) {
        const char* n = namelist[i]->d_name;
        if(IsCurrentDir(n)) {
            continue;
        }

        Local<String> name = NanNew<String>(n);
        free(namelist[i]);
        result->Set(NanNew<Number>(index++), name);
    }

    free(namelist);
    return true;
}
#endif


bool IsCurrentDir(const char* name) {
    if(name[0] == '.') {
        return name[1] == '\0' || (name[1] == '.' && name[2] == '\0');
    }
    return false;
}


NAN_METHOD(ReaddirSyncSafe) {
    NanScope();
    assert(args.Length() == 1);
    assert(args[0]->IsString());

    Local<Array> result = NanNew<Array>();
    Local<String> path_arg = Local<String>::Cast(args[0]);
    String::Utf8Value path(path_arg);

    bool success = ReaddirImpl(*path, result);

    if(success) {
        NanReturnValue(result);
    } else {
        NanReturnValue(NanNull());
    }
}


NAN_METHOD(Test) {
    NanScope();
    Local<Array> ary = NanNew<Array>();
    ary->Set(NanNew<Number>(0), NanNew<String>("Hello"));
    ary->Set(NanNew<Number>(1), NanNew<String>("World"));

    NanReturnValue(ary);
}


void Init(Handle<Object> exports) {
    NODE_SET_METHOD(exports, "readdirSyncSafe", ReaddirSyncSafe);
    NODE_SET_METHOD(exports, "test", Test);
}



NODE_MODULE(speedup, Init)
