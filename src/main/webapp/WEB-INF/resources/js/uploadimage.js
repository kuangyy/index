var camerahelper={


		helper:{
			isPhonegap: function() {
                return (typeof(cordova) !== 'undefined' || typeof(phonegap) !== 'undefined');
            },
            notification: function(msg) {
            	extension.tip(msg);
            },
			getUploadImgUrl: function(action) {
	             // return 'http://192.168.1.185:8080/v2/image/uploadbyform?imageformat=jpeg&iswater=false';
	             return "https://api.yiminbang.com/v1/image/uploadbyform?imageformat=jpeg&iswater=false";
	         },
	         showPicActions: function(successCallBack, errorCallBack) {
	             var buttons1 = [{
	                 text: '从相册中选择',
	                 onClick: function() {
	                 	camerahelper.camera.getPicture(null, successCallBack, errorCallBack)
	                 }
	             }, {
	                 text: '拍照',
	                 onClick: function() {
	                 	camerahelper.camera.getPicture("camera", successCallBack, errorCallBack)
	                 }
	             }];
	             var buttons2 = [{
	                 text: '取消',
	                 color: 'red'
	             }];
	             var groups = [buttons1, buttons2];
	             ymbApp.actions(groups);
	         }
		},

		camera: {
            getPicture: function(from, successCallBack, errorCallBack) {
                if (!camerahelper.helper.isPhonegap()) {
                	camerahelper.helper.notification("此功能只支持 phonegap");
                    return false;
                }
                var netStatus = camerahelper.networkStatus.checkConnection();
                var quality, sourceType;
                if (netStatus == 'WIFI') {
                    quality = 80;
                } else {
                    quality = 50;
                }
                if (from == 'camera') {
                    sourceType = Camera.PictureSourceType.CAMERA;
                } else {
                    sourceType = Camera.PictureSourceType.PHOTOLIBRARY;
                }
                var cameraOptions = {
                    quality: quality || 65,
                    allowEdit: false,
                    sourceType: sourceType,
                    mediaType: Camera.MediaType.PICTURE,
                    targetWidth: 1280,
                    targetHeight: 1920
                };
                navigator.camera.getPicture(successCallBack || this.cameraSuccess, errorCallBack || this.cameraError, cameraOptions);
            },

            cameraSuccess: function(fileUrl) {

            },

            cameraError: function(message) {

            },

            clearCache: function() {
                navigator.camera.cleanup();
            },

            // startUpload: function(url) {
            //     app.fileTransfer.startUpload(url);
            // }
        },
        networkStatus: {
            checkConnection: function() {
                var networkState = navigator.connection.type;
                var states = {};
                states[Connection.UNKNOWN] = 'UNKNOWN';
                states[Connection.ETHERNET] = 'ETHERNET';
                states[Connection.WIFI] = 'WIFI';
                states[Connection.CELL_2G] = 'CELL_2G';
                states[Connection.CELL_3G] = 'CELL_3G';
                states[Connection.CELL_4G] = 'CELL_4G';
                states[Connection.CELL] = 'CELL';
                states[Connection.NONE] = 'NoNetwork';
                return states[networkState];
            }
        },
        fileTransfer: {
            ft: null,
            startUpload: function(fileUrl, successCallBack, errorCallBack) {

                var uploadServer = camerahelper.helper.getUploadImgUrl();

                ymbApp.showPreloader('图片上传中 0%');
                this.$modalTitle = $("#preloader").find("p");
                this.successCallBack = successCallBack;
                /* global FileUploadOptions */
                var options = new FileUploadOptions();
                options.fileKey = 'upfile';
                options.fileName = fileUrl.substr(fileUrl.lastIndexOf('/') + 1);
                options.mimeType = 'image/jpeg';
                options.params = {};
                ft = new FileTransfer();
                ft.upload(fileUrl, encodeURI(uploadServer), this.uploadSuccess, this.uploadFail, options);

                ft.onprogress = this.onprogress;
            },

            uploadSuccess: function(response) {
                // ymbApp.closeModal('.modal');
                // navigator.camera.cleanup();
                ymbApp.hidePreloader();
                camerahelper.fileTransfer.successCallBack(response.response);
            },

            uploadFail: function(error) {
                // ymbApp.closeModal('.modal');
                ymbApp.hidePreloader();
                /* global FileTransferError */
                var errText;
                switch (error.code) {
                    case FileTransferError.FILE_NOT_FOUND_ERR:
                        errText = FILE_NOT_FOUND_ERR;
                        break;
                    case FileTransferError.INVALID_URL_ERR:
                        errText = INVALID_URL_ERR;
                        break;
                    case FileTransferError.CONNECTION_ERR:
                        errText = CONNECTION_ERR;
                        break;
                    case FileTransferError.ABORT_ERR:
                        errText = ABORT_ERR;
                        break;
                    case FileTransferError.NOT_MODIFIED_ERR:
                        errText = NOT_MODIFIED_ERR;
                        break;
                }
                // navigator.camera.cleanup();
                ymbApp.helper.notification("上传失败");
            },

            onprogress: function(progressEvent) {
                if (progressEvent.lengthComputable) {
                    var percent = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    // $$('#progress').parents('.modal-inner').find('.modal-title .percent').html(percent + '%');
                    // $$('#progress').find('.progress-bar').css('width', percent + '%');
                    camerahelper.fileTransfer.$modalTitle.text('图片上传中 ' + percent + '%');
                }
            },

            abortUpload: function() {
                ft.abort();
                // ymbApp.hidePreloader();
            }
        }
}
