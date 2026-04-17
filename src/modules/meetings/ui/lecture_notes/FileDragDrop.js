import React, {
  createRef, useRef, useEffect, useState, useCallback,
} from 'react';

function FileDragDrop({ children, onDrop }) {
  const fileDropper = createRef();
  /*
   * Drag counter is used for counting how many dragIn and dragOut
   * events have occurred. Child components might trigger multiple dragIn
   * and dragOut events so its important to keep track of exactly how many such
   * events have occurred. Only when the counter is 0, we can say that dragging
   * has stopped
   */
  const dragCounter = useRef(0);
  const [isDragging, setDragging] = useState(false);

  const handleDragOver = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const handleDragIn = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();

    dragCounter.current += 1;
    const { items } = event.dataTransfer;
    if (items && items.length > 0) {
      setDragging(true);
    }
  }, []);

  const handleDragOut = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();

    dragCounter.current -= 1;
    if (dragCounter.current > 0) return;
    setDragging(false);
  }, []);

  const handleDrop = useCallback((event) => {
    event.preventDefault();
    event.stopPropagation();

    setDragging(false);
    const { files } = event.dataTransfer;
    if (files && files.length > 0) {
      onDrop(files);
      event.dataTransfer.clearData();
      dragCounter.current = 0;
    }
  }, [onDrop]);

  useEffect(() => {
    const fileDropDiv = fileDropper.current;
    fileDropDiv.addEventListener('dragenter', handleDragIn);
    fileDropDiv.addEventListener('dragleave', handleDragOut);
    fileDropDiv.addEventListener('dragover', handleDragOver);
    fileDropDiv.addEventListener('drop', handleDrop);

    return () => {
      fileDropDiv.removeEventListener('dragenter', handleDragIn);
      fileDropDiv.removeEventListener('dragleave', handleDragOut);
      fileDropDiv.removeEventListener('dragover', handleDragOver);
      fileDropDiv.removeEventListener('drop', handleDrop);
    };
  }, [fileDropper, handleDragIn, handleDragOut, handleDragOver, handleDrop]);

  return (
    <div
      style={{ display: 'inline-block', position: 'relative' }}
      ref={fileDropper}
    >
      {isDragging && (
        <div
          style={{
            border: 'dashed grey 4px',
            backgroundColor: 'rgba(255,255,255,.8)',
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: '50%',
              right: 0,
              left: '50%',
              transform: 'translate(-50%, -50%)',
              color: 'grey',
              fontSize: 36,
            }}
          >
            <div>Drop your files here :'&#41; </div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
}

export default FileDragDrop;
